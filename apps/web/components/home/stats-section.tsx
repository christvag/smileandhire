export function StatsSection() {
  const stats = [
    {
      number: '500+',
      label: 'Companies Trust Us',
      description: 'Leading organizations choose our platform for their hiring needs'
    },
    {
      number: '10,000+',
      label: 'Successful Placements',
      description: 'Professionals found their dream jobs through our platform'
    },
    {
      number: '95%',
      label: 'Satisfaction Rate',
      description: 'Both employers and job seekers love our services'
    },
    {
      number: '24/7',
      label: 'AI-Powered Support',
      description: 'Round-the-clock assistance for profile optimization'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Trusted by Thousands
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform has successfully connected talent with opportunities across various industries
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {stat.number}
              </div>
              <div className="text-xl font-semibold text-gray-900 mb-2">
                {stat.label}
              </div>
              <div className="text-gray-600">
                {stat.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}