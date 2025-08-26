import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, MapPin } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Find Your Dream Job with{' '}
            <span className="text-primary">AI-Powered</span> Matching
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with top companies, create AI-enhanced profiles, and discover 
            opportunities that match your skills and aspirations.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Job title, keywords, or company"
                className="pl-10"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Location"
                className="pl-10"
              />
            </div>
            <Button size="lg" className="w-full">
              Search Jobs
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center">
          <div>
            <div className="text-3xl font-bold text-gray-900">1,000+</div>
            <div className="text-gray-600">Active Jobs</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">500+</div>
            <div className="text-gray-600">Companies</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">10,000+</div>
            <div className="text-gray-600">Job Seekers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-gray-900">95%</div>
            <div className="text-gray-600">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  )
}