import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="text-center py-24">
      <p className="font-serif text-[10rem] leading-none text-forest-dark/15">404</p>
      <h1 className="text-3xl md:text-4xl -mt-4">This shelf is empty.</h1>
      <p className="text-forest-mid mt-3">Maybe a leaf turned. Try the catalog — there's plenty to read.</p>
      <Link to="/" className="btn-primary mt-8 inline-flex">Back to the library</Link>
    </div>
  );
}
