'use client';

import AnimatedCard from '@/components/AnimatedCard';
import IconShowcase from '@/components/IconShowcase';
import AntDesignShowcase from '@/components/AntDesignShowcase';

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-800 dark:to-indigo-800 text-white py-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">UI Library Showcase</h1>
          <p className="text-blue-100 text-lg">Explore all the modern UI packages integrated in this project</p>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12">
        
        {/* Framer Motion Section */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Framer Motion - Animations</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatedCard
              title="Smooth Animations"
              description="Built-in animations with Framer Motion for smooth interactions"
              delay={0}
            />
            <AnimatedCard
              title="Hover Effects"
              description="Interactive hover effects that scale and add shadow"
              delay={0.1}
            />
            <AnimatedCard
              title="Staggered Animations"
              description="Cards animate in sequence with controlled delays"
              delay={0.2}
            />
          </div>
        </section>

        {/* Lucide Icons Section */}
        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <IconShowcase showTitle={true} />
        </section>

        {/* Ant Design Section */}
        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <AntDesignShowcase />
        </section>

        {/* Feature Summary */}
        <section className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">Integrated UI Packages</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-blue-50 dark:bg-slate-700 rounded-lg">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Framer Motion</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Professional animations and transitions for smooth, interactive user experiences
              </p>
            </div>
            <div className="p-4 bg-purple-50 dark:bg-slate-700 rounded-lg">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Lucide Icons</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Beautiful, customizable SVG icons perfect for any design system
              </p>
            </div>
            <div className="p-4 bg-pink-50 dark:bg-slate-700 rounded-lg">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Chakra UI</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Accessible, composable React components for building modern UIs
              </p>
            </div>
            <div className="p-4 bg-orange-50 dark:bg-slate-700 rounded-lg">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Ant Design</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enterprise-grade UI library with comprehensive component suite
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-slate-700 rounded-lg">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Tailwind CSS</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Utility-first CSS framework for rapid UI development
              </p>
            </div>
            <div className="p-4 bg-cyan-50 dark:bg-slate-700 rounded-lg">
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Next.js 14+</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Modern React framework with App Router and Server Components
              </p>
            </div>
          </div>
        </section>

        {/* Installation Guide */}
        <section className="bg-slate-950 dark:bg-black rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-3xl font-bold mb-6">Package Installation</h2>
          <div className="space-y-4 font-mono text-sm">
            <div>
              <p className="text-gray-400 mb-2"># Framer Motion</p>
              <p className="bg-slate-800 p-2 rounded">npm install framer-motion</p>
            </div>
            <div>
              <p className="text-gray-400 mb-2"># Lucide React Icons</p>
              <p className="bg-slate-800 p-2 rounded">npm install lucide-react</p>
            </div>
            <div>
              <p className="text-gray-400 mb-2"># Chakra UI</p>
              <p className="bg-slate-800 p-2 rounded">npm install @chakra-ui/react @emotion/react @emotion/styled</p>
            </div>
            <div>
              <p className="text-gray-400 mb-2"># Ant Design</p>
              <p className="bg-slate-800 p-2 rounded">npm install antd</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
