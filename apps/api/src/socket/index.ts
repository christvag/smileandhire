import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '@worky-happy/database';
import { logger } from '../utils/logger';

interface SocketUser {
  id: string;
  role: string;
  email: string;
}

export const initializeSocket = (io: Server) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, email: true, isBanned: true }
      });

      if (!user || user.isBanned) {
        return next(new Error('Authentication failed'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const user: SocketUser = socket.data.user;
    logger.info(`User connected: ${user.email} (${socket.id})`);

    // Join user to their personal room
    socket.join(`user:${user.id}`);

    // Join appropriate role-based rooms
    socket.join(`role:${user.role.toLowerCase()}`);

    // Handle joining application-specific rooms
    socket.on('join:application', async (applicationId: string) => {
      try {
        const application = await prisma.application.findUnique({
          where: { id: applicationId },
          include: {
            job: {
              include: {
                company: true
              }
            },
            applicant: {
              include: {
                user: true
              }
            }
          }
        });

        if (!application) {
          socket.emit('error', { message: 'Application not found' });
          return;
        }

        // Check if user is authorized to join this application room
        const isApplicant = application.applicant.user.id === user.id;
        const isCompanyOwner = application.job.company.userId === user.id;
        const isAdmin = user.role === 'ADMIN';

        if (isApplicant || isCompanyOwner || isAdmin) {
          socket.join(`application:${applicationId}`);
          socket.emit('joined:application', { applicationId });
          logger.info(`User ${user.email} joined application room: ${applicationId}`);
        } else {
          socket.emit('error', { message: 'Not authorized to join this application' });
        }
      } catch (error) {
        logger.error('Join application error:', error);
        socket.emit('error', { message: 'Failed to join application room' });
      }
    });

    // Handle joining conversation rooms
    socket.on('join:conversation', async (conversationId: string) => {
      try {
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId }
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        // Check if user is participant in conversation
        if (conversation.participantIds.includes(user.id)) {
          socket.join(`conversation:${conversationId}`);
          socket.emit('joined:conversation', { conversationId });
          logger.info(`User ${user.email} joined conversation room: ${conversationId}`);
        } else {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
        }
      } catch (error) {
        logger.error('Join conversation error:', error);
        socket.emit('error', { message: 'Failed to join conversation room' });
      }
    });

    // Handle sending messages in conversation
    socket.on('send:conversation:message', async (data: {
      conversationId: string;
      content: string;
      messageType?: string;
      replyToId?: string;
    }) => {
      try {
        const { conversationId, content, messageType = 'text', replyToId } = data;

        // Verify conversation access
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId }
        });

        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }

        if (!conversation.participantIds.includes(user.id)) {
          socket.emit('error', { message: 'Not authorized to send messages in this conversation' });
          return;
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            conversationId,
            senderId: user.id,
            content,
            messageType,
            replyToId
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true
              }
            },
            replyTo: {
              include: {
                sender: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        });

        // Update conversation lastMessage info
        await prisma.conversation.update({
          where: { id: conversationId },
          data: {
            lastMessageId: message.id,
            lastMessageAt: new Date()
          }
        });

        // Emit message to conversation room
        io.to(`conversation:${conversationId}`).emit('new:conversation:message', message);

        // Send notification to other participants
        const otherParticipants = conversation.participantIds.filter(id => id !== user.id);
        otherParticipants.forEach(participantId => {
          io.to(`user:${participantId}`).emit('notification', {
            type: 'message',
            title: 'New Message',
            message: `${message.sender.firstName} sent you a message`,
            data: { conversationId, messageId: message.id }
          });
        });

        logger.info(`Message sent in conversation ${conversationId} from ${user.email}`);
      } catch (error) {
        logger.error('Send conversation message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle sending messages (legacy support)
    socket.on('send:message', async (data: {
      applicationId: string;
      recipientId: string;
      content: string;
      messageType?: string;
    }) => {
      try {
        const { applicationId, recipientId, content, messageType = 'text' } = data;

        // Verify application access
        const application = await prisma.application.findUnique({
          where: { id: applicationId },
          include: {
            job: {
              include: {
                company: true
              }
            },
            applicant: {
              include: {
                user: true
              }
            }
          }
        });

        if (!application) {
          socket.emit('error', { message: 'Application not found' });
          return;
        }

        const isApplicant = application.applicant.user.id === user.id;
        const isCompanyOwner = application.job.company.userId === user.id;

        if (!isApplicant && !isCompanyOwner) {
          socket.emit('error', { message: 'Not authorized to send messages in this application' });
          return;
        }

        // Create or find conversation for this application
        const participantIds = [user.id, recipientId].sort();
        let conversation = await prisma.conversation.findFirst({
          where: {
            participantIds: { equals: participantIds },
            applicationId
          }
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              participantIds,
              applicationId
            }
          });
        }

        // Create message in database
        const message = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderId: user.id,
            content,
            messageType
          },
          include: {
            sender: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                role: true
              }
            }
          }
        });

        // Update conversation
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageId: message.id,
            lastMessageAt: new Date()
          }
        });

        // Emit message to application room and conversation room
        io.to(`application:${applicationId}`).emit('new:message', message);
        io.to(`conversation:${conversation.id}`).emit('new:conversation:message', message);

        // Send notification to recipient
        io.to(`user:${recipientId}`).emit('notification', {
          type: 'message',
          title: 'New Message',
          message: `${message.sender.firstName} sent you a message`,
          data: { applicationId, conversationId: conversation.id, messageId: message.id }
        });

        logger.info(`Message sent in application ${applicationId} from ${user.email}`);
      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators for conversations
    socket.on('typing:conversation:start', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user:typing', {
        userId: user.id,
        userName: `${user.email}`,
        isTyping: true
      });
    });

    socket.on('typing:conversation:stop', (data: { conversationId: string }) => {
      socket.to(`conversation:${data.conversationId}`).emit('user:typing', {
        userId: user.id,
        userName: `${user.email}`,
        isTyping: false
      });
    });

    // Handle typing indicators (legacy support)
    socket.on('typing:start', (data: { applicationId: string }) => {
      socket.to(`application:${data.applicationId}`).emit('user:typing', {
        userId: user.id,
        userName: `${user.email}`,
        isTyping: true
      });
    });

    socket.on('typing:stop', (data: { applicationId: string }) => {
      socket.to(`application:${data.applicationId}`).emit('user:typing', {
        userId: user.id,
        userName: `${user.email}`,
        isTyping: false
      });
    });

    // Handle application status updates (for real-time notifications)
    socket.on('application:status:update', async (data: {
      applicationId: string;
      status: string;
      notes?: string;
    }) => {
      try {
        if (user.role !== 'CLIENT' && user.role !== 'ADMIN') {
          socket.emit('error', { message: 'Not authorized to update application status' });
          return;
        }

        const application = await prisma.application.findUnique({
          where: { id: data.applicationId },
          include: {
            job: {
              include: {
                company: true
              }
            },
            applicant: {
              include: {
                user: true
              }
            }
          }
        });

        if (!application) {
          socket.emit('error', { message: 'Application not found' });
          return;
        }

        // Check authorization
        if (user.role === 'CLIENT' && application.job.company.userId !== user.id) {
          socket.emit('error', { message: 'Not authorized to update this application' });
          return;
        }

        // Emit status update to application room
        io.to(`application:${data.applicationId}`).emit('application:status:updated', {
          applicationId: data.applicationId,
          status: data.status,
          notes: data.notes,
          updatedBy: {
            id: user.id,
            name: `${user.email}`,
            role: user.role
          }
        });

        // Send notification to applicant
        io.to(`user:${application.applicant.user.id}`).emit('notification', {
          type: 'application_update',
          title: 'Application Status Updated',
          message: `Your application status has been updated to: ${data.status}`,
          data: { applicationId: data.applicationId, status: data.status }
        });

        logger.info(`Application status updated: ${data.applicationId} -> ${data.status}`);
      } catch (error) {
        logger.error('Application status update error:', error);
        socket.emit('error', { message: 'Failed to update application status' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${user.email} (${socket.id})`);
    });
  });

  logger.info('🔌 Socket.IO server initialized');
};