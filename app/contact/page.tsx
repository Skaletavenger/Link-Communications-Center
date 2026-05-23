export default function Contact() {
  return (
    <section className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
      <form className="grid gap-4 max-w-lg">
        <input className="p-3 rounded bg-white/5" placeholder="Name" />
        <input className="p-3 rounded bg-white/5" placeholder="Email" />
        <textarea className="p-3 rounded bg-white/5" placeholder="Message" rows={6} />
        <button className="btn w-40">Send</button>
      </form>
    </section>
  );
}
