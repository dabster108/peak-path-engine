import { useEffect, useMemo, useState } from "react";
import { useUser } from "../context/UserContext";
import api from "../utils/api";
import "./Blog.css";

const CATEGORY_OPTIONS = [
  "Trail Notes",
  "Gear Guide",
  "Adventure Story",
  "Pack Science",
  "How-To",
];

const publishingPrompts = [
  { day: "Monday",    idea: "2-minute gear checklist for this week's weather" },
  { day: "Wednesday", idea: "one trail lesson from a recent customer story" },
  { day: "Friday",    idea: "quick how-to with one practical photo or diagram" },
];

const defaultForm = {
  title:    "",
  category: "Trail Notes",
  author:   "",
  excerpt:  "",
  content:  "",
};

function formatBlogDate(value) {
  return new Date(value).toLocaleDateString("en-NP", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function countPostsInLastDays(posts, days) {
  const threshold = Date.now() - days * 24 * 60 * 60 * 1000;
  return posts.filter((p) => new Date(p.created_at).getTime() >= threshold).length;
}

export default function Blog() {
  const { user, displayName, isAdmin } = useUser();

  const [posts, setPosts]                   = useState([]);
  const [loading, setLoading]               = useState(true);
  const [fetchError, setFetchError]         = useState("");

  const [form, setForm]                     = useState(defaultForm);
  const [formError, setFormError]           = useState("");
  const [publishSuccess, setPublishSuccess] = useState("");
  const [publishing, setPublishing]         = useState(false);

  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [searchTerm, setSearchTerm]             = useState("");

  // Pre-fill author from logged-in user
  useEffect(() => {
    setForm((prev) => ({ ...prev, author: displayName || "" }));
  }, [displayName]);

  // Fetch all posts
  useEffect(() => {
    setLoading(true);
    setFetchError("");
    api.get("blog/")
      .then((res) => setPosts(res.data))
      .catch(() => setFetchError("Could not load posts. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const vals = [...new Set(posts.map((p) => p.category))];
    return ["All Categories", ...vals];
  }, [posts]);

  const filteredPosts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return posts.filter((p) => {
      const catMatch = selectedCategory === "All Categories" || p.category === selectedCategory;
      if (!catMatch) return false;
      if (!q) return true;
      return [p.title, p.excerpt, p.author].join(" ").toLowerCase().includes(q);
    });
  }, [posts, searchTerm, selectedCategory]);

  const postsThisMonth = useMemo(() => countPostsInLastDays(posts, 30), [posts]);
  const userPostCount  = useMemo(() => posts.filter((p) => p.source === "user").length, [posts]);

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError("");
    setPublishSuccess("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.title.trim())                            { setFormError("Please add a blog title.");              return; }
    if (!form.author.trim())                           { setFormError("Please add your name.");                 return; }
    if (!form.excerpt.trim())                          { setFormError("Please add a short summary.");           return; }
    if (form.content.trim().length < 120)              { setFormError("Content must be at least 120 characters."); return; }

    setPublishing(true);
    try {
      const res = await api.post("blog/", {
        title:    form.title.trim(),
        category: form.category,
        author:   form.author.trim(),
        excerpt:  form.excerpt.trim(),
        content:  form.content.trim(),
      });
      setPosts((prev) => [res.data, ...prev]);
      setForm({ ...defaultForm, author: displayName || "" });
      setPublishSuccess("Your blog is live on the community feed.");
    } catch (err) {
      const data = err?.response?.data;
      if (data && typeof data === "object") {
        const first = Object.values(data)[0];
        setFormError(Array.isArray(first) ? first[0] : String(first));
      } else {
        setFormError("Failed to publish. Please try again.");
      }
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete(postId) {
    if (!window.confirm("Delete this post?")) return;
    try {
      await api.delete(`blog/${postId}/`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch {
      alert("Could not delete post. Please try again.");
    }
  }

  return (
    <div className="blog-page">
      <section className="blog-hero">
        <div className="blog-hero__glow" />
        <div className="container blog-hero__inner">
          <span className="section-label">Trail Journal</span>
          <h1 className="blog-hero__title">SHIKHAR Blog Studio</h1>
          <p className="blog-hero__sub">
            Publish field stories, guides, and gear wisdom. Build discovery, earn trust,
            and grow long-term traffic from practical outdoor content.
          </p>
        </div>
      </section>

      <section className="blog-pulse">
        <div className="container blog-pulse__grid">
          <article className="blog-pulse__card">
            <p className="blog-pulse__label">Publishing Pulse</p>
            <h3>{postsThisMonth} posts in the last 30 days</h3>
            <p>Keep momentum by publishing practical stories at least 2 times per week.</p>
          </article>
          <article className="blog-pulse__card">
            <p className="blog-pulse__label">Community Signals</p>
            <h3>{userPostCount} community contributions</h3>
            <p>New local stories improve trust and help your audience discover fresh routes and gear decisions.</p>
          </article>
          <article className="blog-pulse__card">
            <p className="blog-pulse__label">Cadence Target</p>
            <h3>8 posts per month</h3>
            <p>Use short checklists and trail updates to stay consistent even during busy expedition weeks.</p>
          </article>
        </div>
      </section>

      <section className="blog-section">
        <div className="container blog-grid">
          <article className="blog-publish-card">
            <h2>Write a New Blog</h2>
            <p>Use this editor to publish useful posts for your audience. Keep it practical, personal, and trail-tested.</p>

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
                  <select value={form.category} onChange={(e) => handleChange("category", e.target.value)}>
                    {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
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

              {formError       && <p className="blog-form__error">{formError}</p>}
              {publishSuccess  && <p className="blog-form__success">{publishSuccess}</p>}

              <button type="submit" className="blog-form__publish" disabled={publishing}>
                {publishing ? "Publishing…" : "Publish Blog"}
              </button>
            </form>
          </article>

          <aside className="blog-guidelines">
            <h3>What Converts Best</h3>
            <ul>
              <li>Start with a real trail problem and solve it step-by-step.</li>
              <li>Use concrete gear names, weather ranges, and checklists.</li>
              <li>Close with a practical takeaway readers can use instantly.</li>
            </ul>
            <div className="blog-guidelines__note">
              Pro tip: publishing one strong guide weekly can compound organic traffic over time.
            </div>
            <div className="blog-guidelines__plan">
              <h4>Weekly Posting Rhythm</h4>
              <ul>
                {publishingPrompts.map((prompt) => (
                  <li key={prompt.day}><strong>{prompt.day}:</strong> {prompt.idea}</li>
                ))}
              </ul>
            </div>

          </aside>
        </div>
      </section>

      <section className="blog-feed">
        <div className="container">
          <div className="blog-feed__head">
            <h2>Latest Posts</h2>
            <p>{posts.length} stories in the journal</p>
          </div>

          <div className="blog-feed__controls">
            <label>
              Search
              <input
                type="search"
                placeholder="Search title, author, or summary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </label>
            <label>
              Category
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {categories.map((c) => <option key={c}>{c}</option>)}
              </select>
            </label>
            <p className="blog-feed__results">
              Showing {filteredPosts.length} of {posts.length}
            </p>
          </div>

          {loading    && <p style={{ color: "var(--color-text-secondary)", padding: "2rem 0" }}>Loading posts…</p>}
          {fetchError && <p className="blog-form__error">{fetchError}</p>}

          {!loading && (
            <div className="blog-feed__grid">
              {filteredPosts.map((post) => (
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
                    <span>{formatBlogDate(post.created_at)}</span>
                  </div>

                  {/* Show delete button for own posts or admin */}
                  {(isAdmin || (user && post.source === "user")) && (
                    <button
                      className="blog-card__delete"
                      onClick={() => handleDelete(post.id)}
                      aria-label="Delete post"
                    >
                      ✕
                    </button>
                  )}
                </article>
              ))}

              {!filteredPosts.length && (
                <article className="blog-feed__empty">
                  <h3>No posts found</h3>
                  <p>Try a different category or clear search to explore more stories.</p>
                </article>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}