import { motion } from 'framer-motion';
import { 
  Users, 
  TrendingDown, 
  Leaf, 
  Heart, 
  Building, 
  Shield 
} from 'lucide-react';

const impactItems = [
  {
    icon: Users,
    title: 'Reduced Overcrowding',
    description: 'Smart distribution of visitors prevents congestion at popular sites',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
  },
  {
    icon: Heart,
    title: 'Better Experience',
    description: 'Visitors enjoy peaceful, authentic experiences at hidden gems',
    color: 'text-rose-600',
    bg: 'bg-rose-100',
  },
  {
    icon: TrendingDown,
    title: 'Balanced Tourism',
    description: 'Even distribution of tourists across all zones of the city',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
  {
    icon: Building,
    title: 'Economic Growth',
    description: 'New areas benefit from tourism, supporting local businesses',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
  },
  {
    icon: Leaf,
    title: 'Environmental Care',
    description: 'Reduced wear on heritage sites ensures preservation for generations',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  {
    icon: Shield,
    title: 'Heritage Protection',
    description: 'Less pressure on ancient monuments means better conservation',
    color: 'text-teal-600',
    bg: 'bg-teal-100',
  },
];

export function SustainabilitySection() {
  return (
    <section className="py-16 bg-muted/50 -mx-6 px-6 md:-mx-8 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-secondary/20 text-secondary font-medium text-sm mb-4">
            🌍 Sustainable Tourism
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Decentralised Tourism Matters
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            By spreading visitors across Mysore's many attractions, we create a better 
            experience for everyone while protecting our precious heritage.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {impactItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card p-6 rounded-2xl shadow-card hover:shadow-elevated transition-shadow"
              >
                <div className={`inline-flex p-3 rounded-xl ${item.bg} mb-4`}>
                  <Icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-2">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: '40%', label: 'Crowd Reduction' },
            { value: '15+', label: 'Hidden Gems' },
            { value: '4', label: 'Tourism Zones' },
            { value: '100%', label: 'Local Focus' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-card shadow-soft"
            >
              <div className="font-serif text-3xl md:text-4xl font-bold text-gradient-primary mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
