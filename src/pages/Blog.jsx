import { useEffect, useMemo, useState } from "react";
import "./Blog.css";

const BLOG_STORAGE_KEY = "shikhar_user_blog_posts";

const featuredPosts = [
  {
    id: "f-1",
    title: "5 Layering Rules That Actually Work in Himalayan Weather",
    excerpt:
      "From base fabrics to shell pairing, this is the exact system our team uses when weather flips from sun to sleet in a single climb.",
    author: "Shikhar Team",
    category: "Gear Guide",
    createdAt: "2026-02-18T09:30:00.000Z",
    source: "featured",
  },
  {
    id: "f-2",
    title: "Trail to Summit: Planning a 2-Day Monsoon Trek Safely",
    excerpt:
      "A practical breakdown of route prep, hydration planning, and footwear strategy for slippery ridgelines and fast cloud build-up.",
    author: "Route Desk",
    category: "Trail Notes",
    createdAt: "2026-01-24T11:00:00.000Z",
    source: "featured",
  },
  {
    id: "f-3",
    title: "Backpack Fit Mistakes That Cause Shoulder Burn",
    excerpt:
      "Most pain starts before the trek begins. Learn how to dial load lifters, hip belts, and torso sizing in under ten minutes.",
    author: "Field Lab",
    category: "Pack Science",
    createdAt: "2025-12-14T07:15:00.000Z",
    source: "featured",
  },
];

const defaultForm = {
  title: "",
  category: "Trail Notes",
  author: "",
  excerpt: "",
  content: "",
};

function readStoredPosts() {
  try {
    const raw = localStorage.getItem(BLOG_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatBlogDate(value) {
  return new Date(value).toLocaleDateString("en-NP", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Blog() {
  const [form, setForm] = useState(defaultForm);
  const [formError, setFormError] = useState("");
  const [publishSuccess, setPublishSuccess] = useState("");
  const [userPosts, setUserPosts] = useState(() => readStoredPosts());

  useEffect(() => {
    localStorage.setItem(BLOG_STORAGE_KEY, JSON.stringify(userPosts));
  }, [userPosts]);

  const allPosts = useMemo(
    () =>
      [...userPosts, ...featuredPosts].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [userPosts],
  );

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError("");
    setPublishSuccess("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.title.trim()) {
      setFormError("Please add a blog title.");
      return;
    }
    if (!form.author.trim()) {
      setFormError("Please add your name.");
      return;
    }
    if (!form.excerpt.trim()) {
      setFormError("Please add a short summary.");
      return;
    }
    if (!form.content.trim() || form.content.trim().length < 120) {
      setFormError("Blog content should be at least 120 characters.");
      return;
    }

    const post = {
      id: `u-${Date.now()}`,
      title: form.title.trim(),
      category: form.category,
      author: form.author.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content.trim(),
      createdAt: new Date().toISOString(),
      source: "user",
    };

    setUserPosts((prev) => [post, ...prev]);
    setForm(defaultForm);
    setPublishSuccess("Your blog is live on the community feed.");
  };

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="blog-hero__glow" />
        <div className="container blog-hero__inner">
          <span className="section-label">Trail Journal</span>
          <h1 className="blog-hero__title">SHIKHAR Blog Studio</h1>
          <p className="blog-hero__sub">
            Publish field stories, guides, and gear wisdom. Build discovery,
            earn trust, and grow long-term traffic from practical outdoor
            content.
          </p>
        </div>
      </section>

      <section className="blog-section">
        <div className="container blog-grid">
          <article className="blog-publish-card">
            <h2>Write a New Blog</h2>
            <p>
              Use this editor to publish useful posts for your audience. Keep it
              practical, personal, and trail-tested.
            </p>

            <form className="blog-form" onSubmit={handleSubmit}>
              <div className="blog-form__row">
                <label>
                  Blog Title
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Example: Rain Layering for First-Time Trekkers"
                  />
                </label>
              </div>

              <div className="blog-form__row blog-form__row--two">
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                  >
                    <option>Trail Notes</option>
                    <option>Gear Guide</option>
                    <option>Adventure Story</option>
                    <option>Pack Science</option>
                    <option>How-To</option>
                  </select>
                </label>
                <label>
                  Author Name
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => handleChange("author", e.target.value)}
                    placeholder="Your name"
                  />
                </label>
              </div>

              <div className="blog-form__row">
                <label>
                  Short Summary
                  <textarea
                    rows="2"
                    value={form.excerpt}
                    onChange={(e) => handleChange("excerpt", e.target.value)}
                    placeholder="2-3 lines that explain why this post matters"
                  />
                </label>
              </div>

              <div className="blog-form__row">
                <label>
                  Full Blog Content
                  <textarea
                    rows="6"
                    value={form.content}
                    onChange={(e) => handleChange("content", e.target.value)}
                    placeholder="Write your full blog here..."
                  />
                </label>
              </div>

              {formError && <p className="blog-form__error">{formError}</p>}
              {publishSuccess && (
                <p className="blog-form__success">{publishSuccess}</p>
              )}

              <button type="submit" className="blog-form__publish">
                Publish Blog
              </button>
            </form>
          </article>

          <aside className="blog-guidelines">
            <h3>What Converts Best</h3>
            <ul>
              <li>
                Start with a real trail problem and solve it step-by-step.
              </li>
              <li>Use concrete gear names, weather ranges, and checklists.</li>
              <li>
                Close with a practical takeaway readers can use instantly.
              </li>
            </ul>
            <div className="blog-guidelines__note">
              Pro tip: publishing one strong guide weekly can compound organic
              traffic over time.
            </div>
          </aside>
        </div>
      </section>

      <section className="blog-feed">
        <div className="container">
          <div className="blog-feed__head">
            <h2>Latest Posts</h2>
            <p>{allPosts.length} stories in the journal</p>
          </div>

          <div className="blog-feed__grid">
            {allPosts.map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-card__meta">
                  <span className="blog-card__tag">{post.category}</span>
                  {post.source === "user" && (
                    <span className="blog-card__source">Community</span>
                  )}
                </div>
                <h3>{post.title}</h3>
                <p>{post.excerpt}</p>
                <div className="blog-card__footer">
                  <span>{post.author}</span>
                  <span>{formatBlogDate(post.createdAt)}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
