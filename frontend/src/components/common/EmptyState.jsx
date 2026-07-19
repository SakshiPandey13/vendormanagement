import { motion } from 'framer-motion';

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-4 text-center"
  >
    {Icon && (
      <div className="w-16 h-16 bg-secondary-100 dark:bg-secondary-700 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-secondary-400" />
      </div>
    )}
    <h3 className="text-base font-semibold text-secondary-700 dark:text-secondary-200">{title}</h3>
    {description && <p className="text-sm text-secondary-400 mt-1 max-w-sm">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </motion.div>
);

export default EmptyState;
