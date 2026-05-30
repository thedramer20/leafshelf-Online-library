import Leaf from './Leaf';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-forest-dark/10 py-10 px-6 text-center text-sm text-forest-mid">
      <div className="flex items-center justify-center gap-2 text-forest-dark font-serif text-lg mb-2">
        <Leaf className="w-5 h-5" />
        LeafShelf
      </div>
      <p className="opacity-70">A quiet shelf for the noisy world.</p>
      <p className="mt-3 text-xs opacity-60">
        Built with React · TypeScript · Servlets · JSP · JavaBeans · JDBC
      </p>
    </footer>
  );
}
