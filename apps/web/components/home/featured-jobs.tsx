import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, Building2 } from 'lucide-react'

// Mock data - will be replaced with API call
const featuredJobs = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    company: {
      name: 'TechCorp Solutions',
      logo: '/placeholder-logo.png'
    },
    location: 'Manila, Philippines',
    salaryMin: 60000,
    salaryMax: 90000,
    employmentType: 'FULL_TIME',
    isRemote: false,
    isUrgent: true,
    tags: ['React', 'TypeScript', 'Next.js'],
    createdAt: new Date('2024-01-10'),
    applicationsCount: 15
  },
  {
    id: '2',
    title: 'Virtual Assistant - Administrative Support',
    company: {
      name: 'The VA Group',
      logo: '/placeholder-logo.png'
    },
    location: 'Remote',
    salaryMin: 25000,
    salaryMax: 35000,
    employmentType: 'FULL_TIME',
    isRemote: true,
    isUrgent: false,
    tags: ['Administrative', 'Customer Service', 'Remote'],
    createdAt: new Date('2024-01-08'),
    applicationsCount: 32
  },
  {
    id: '3',
    title: 'Digital Marketing Manager',
    company: {
      name: 'Creative Agency Pro',
      logo: '/placeholder-logo.png'
    },
    location: 'Cebu, Philippines',
    salaryMin: 45000,
    salaryMax: 65000,
    employmentType: 'FULL_TIME',
    isRemote: false,
    isUrgent: false,
    tags: ['Digital Marketing', 'SEO', 'Social Media'],
    createdAt: new Date('2024-01-05'),
    applicationsCount: 8
  }
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatRelativeTime(date: Date) {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
}

export function FeaturedJobs() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Featured Job Opportunities
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover hand-picked job opportunities from top companies looking for talented professionals
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {featuredJobs.map((job) => (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg leading-tight">{job.title}</CardTitle>
                      <p className="text-sm text-gray-600">{job.company.name}</p>
                    </div>
                  </div>
                  {job.isUrgent && (
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                      Urgent
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pb-4">
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {job.location}
                    {job.isRemote && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Remote
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {formatCurrency(job.salaryMin)} - {formatCurrency(job.salaryMax)}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {formatRelativeTime(job.createdAt)} • {job.applicationsCount} applicants
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {job.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Link href={`/jobs/${job.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/jobs">
            <Button variant="outline" size="lg">
              View All Jobs
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}