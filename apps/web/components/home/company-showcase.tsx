import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, Star } from 'lucide-react'

// Mock data - will be replaced with API call
const featuredCompanies = [
  {
    id: '1',
    name: 'The VA Group',
    description: 'Leading virtual assistant services company providing top-tier remote support to businesses worldwide.',
    industry: 'Virtual Assistant Services',
    location: 'Remote',
    rating: 4.5,
    ratingCount: 25,
    activeJobs: 5,
    size: '11-50'
  },
  {
    id: '2',
    name: 'TechCorp Solutions',
    description: 'Innovative technology solutions for modern businesses with cutting-edge development practices.',
    industry: 'Technology',
    location: 'Manila, Philippines',
    rating: 4.2,
    ratingCount: 18,
    activeJobs: 8,
    size: '51-200'
  },
  {
    id: '3',
    name: 'Creative Agency Pro',
    description: 'Full-service digital marketing agency specializing in brand growth and online presence.',
    industry: 'Marketing & Advertising',
    location: 'Cebu, Philippines',
    rating: 4.7,
    ratingCount: 32,
    activeJobs: 3,
    size: '11-50'
  },
  {
    id: '4',
    name: 'Global Finance Corp',
    description: 'Premier financial services provider with comprehensive investment and consulting solutions.',
    industry: 'Financial Services',
    location: 'Makati, Philippines',
    rating: 4.3,
    ratingCount: 41,
    activeJobs: 6,
    size: '200+'
  }
]

export function CompanyShowcase() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Top Companies Hiring
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join industry-leading companies that value talent and offer exceptional career growth opportunities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {featuredCompanies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-8 w-8 text-gray-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {company.name}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600">
                          {company.rating} ({company.ratingCount})
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {company.description}
                    </p>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {company.location}
                      <span className="mx-2">•</span>
                      {company.industry}
                      <span className="mx-2">•</span>
                      {company.size} employees
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        {company.activeJobs} open positions
                      </span>
                      <Link href={`/companies/${company.id}`}>
                        <Button variant="outline" size="sm">
                          View Company
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/companies">
            <Button variant="outline" size="lg">
              View All Companies
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}