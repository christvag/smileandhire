import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get conversations for the authenticated user
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: userId
        },
        isActive: true
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
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
        },
        application: {
          include: {
            job: {
              select: {
                title: true,
                company: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    // Get participant details for each conversation
    const conversationsWithParticipants = await Promise.all(
      conversations.map(async (conv) => {
        const participants = await prisma.user.findMany({
          where: {
            id: {
              in: conv.participantIds
            }
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            role: true,
            company: {
              select: {
                name: true,
                username: true
              }
            }
          }
        });

        // Calculate unread count
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: conv.id,
            senderId: { not: userId },
            isRead: false,
            isDeleted: false
          }
        });

        return {
          ...conv,
          participants,
          unreadCount
        };
      })
    );

    res.json({
      success: true,
      conversations: conversationsWithParticipants
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations'
    });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Verify user is participant in conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participantIds: { has: userId }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    const skip = (Number(page) - 1) * Number(limit);
    
    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        isDeleted: false
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
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({
      success: true,
      messages: messages.reverse(),
      hasMore: messages.length === Number(limit)
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages'
    });
  }
});

// Send a message
router.post('/conversations/:conversationId/messages', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { conversationId } = req.params;
    const { content, messageType = 'text', fileUrl, replyToId } = req.body;

    if (!content?.trim() && !fileUrl) {
      return res.status(400).json({
        success: false,
        message: 'Message content or file is required'
      });
    }

    // Verify user is participant in conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participantIds: { has: userId }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Conversation not found or access denied'
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId!,
        content: content?.trim() || '',
        messageType,
        fileUrl,
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

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message'
    });
  }
});

// Start a new conversation
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { participantId, applicationId } = req.body;

    if (!participantId) {
      return res.status(400).json({
        success: false,
        message: 'Participant ID is required'
      });
    }

    // Verify participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId }
    });

    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    const participantIds = [userId!, participantId].sort();
    
    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participantIds: { equals: participantIds },
        applicationId: applicationId || null
      }
    });

    if (existingConversation) {
      return res.json({
        success: true,
        conversation: existingConversation,
        isNew: false
      });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participantIds,
        applicationId
      },
      include: {
        application: {
          include: {
            job: {
              select: {
                title: true,
                company: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      conversation,
      isNew: true
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create conversation'
    });
  }
});

// Delete a message (soft delete)
router.delete('/messages/:messageId', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;
    const { messageId } = req.params;

    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        senderId: userId
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found or access denied'
      });
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

export { router as messagesRouter };