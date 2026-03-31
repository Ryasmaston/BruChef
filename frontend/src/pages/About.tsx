import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BubbleBackground from '../components/BubbleBackground'

export default function About() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  const features = [
    {
      icon: '',
      title: 'Discover Recipes',
      desc: 'Browse a curated library of classic and community cocktail recipes, with difficulty ratings and full ingredient lists.',
      delay: 300
    },
    {
      icon: '',
      title: 'Manage Your Bar',
      desc: 'Track exactly what\'s in your inventory and instantly see which cocktails you can make tonight with what you have.',
      delay: 400
    },
    {
      icon: '',
      title: 'Create & Share',
      desc: 'Build your own cocktail recipes, submit them for community review, and share your creations with other bartenders.',
      delay: 500
    },
    {
      icon: '',
      title: 'Save Favourites',
      desc: 'Star the cocktails you love and find them instantly from your personal favourites list.',
      delay: 600
    },
    {
      icon: '',
      title: 'Smart Matching',
      desc: 'BruChef understands ingredient hierarchies — add Rum to your inventory and it covers all rum-based cocktails.',
      delay: 700
    },
    {
      icon: '',
      title: 'Community Recipes',
      desc: 'Explore cocktails created by other users that have been reviewed and approved for the community library.',
      delay: 800
    }
  ]

  const stack = [
    { label: 'Frontend', value: 'React + TypeScript' },
    { label: 'Styling', value: 'Tailwind CSS' },
    { label: 'Backend', value: 'Flask + Python' },
    { label: 'Database', value: 'PostgreSQL' },
    { label: 'ORM', value: 'SQLAlchemy' },
    { label: 'Auth', value: 'Flask Sessions' }
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <div className="relative rounded-2xl overflow-hidden opacity-0 animate-fade-in-blur animation-delay-100">
        <div className="animate-morph-gradient absolute inset-0" />
        <BubbleBackground />
        <div className="relative z-10 pt-14 pb-14 px-8 text-center">
          <h1 className="text-5xl font-calivorne text-white mb-4 animate-reveal-up">
            About <span className="animate-shimmer">BruChef</span>
          </h1>
          <p className="text-lg text-slate-300 font-thin max-w-xl mx-auto leading-relaxed">
            Your personal bartender companion — built for home mixologists who want to
            make the most of what's behind their bar.
          </p>
        </div>
      </div>
      <div className="opacity-0 animate-fade-in-up animation-delay-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            The Idea
          </span>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8">
          <p className="text-slate-300 font-thin leading-relaxed text-lg">
            BruChef started as a simple question — <span className="text-white font-medium">what can I actually make right now?</span> Most
            cocktail apps show you recipes but don't know what you have. BruChef connects
            your inventory to the recipe library so you always know exactly what you can pour,
            what you're missing, and what to pick up next time you're at the shops.
          </p>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-3 mb-6 opacity-0 animate-fade-in-up animation-delay-200">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            What BruChef does
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              style={{ animationDelay: `${feature.delay}ms` }}
              className="opacity-0 animate-fade-in-up bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-emerald-500/50 transition-colors"
            >
              <div className="text-3xl mb-0">{feature.icon}</div>
              <h3 className="text-white font-calivorne text-2xl text-center mb-2">{feature.title}</h3>
              <p className="text-sm text-center text-slate-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="opacity-0 animate-fade-in-up animation-delay-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
            Built with
          </span>
        </div>
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stack.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <span className="text-xs text-slate-500 uppercase tracking-wider">{item.label}</span>
                <span className="text-white font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
