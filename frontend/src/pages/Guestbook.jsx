import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const formatTimestamp = (value) => {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

function Guestbook() {
  const [form, setForm] = useState({ name: "", message: "" });
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/messages`);
      setMessages(response.data);
      setLastUpdated(new Date());
      setStatus("");
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to load messages.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isActive = true;

    const syncMessages = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/messages`);
        if (!isActive) {
          return;
        }

        setMessages(response.data);
        setLastUpdated(new Date());
      } catch (error) {
        if (!isActive) {
          return;
        }

        setStatus(error.response?.data?.message || "Unable to load messages.");
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    syncMessages();
    const intervalId = setInterval(syncMessages, 4000);

    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({
      ...currentForm,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim() || !form.message.trim()) {
      setStatus("Please add both your name and a message.");
      return;
    }

    setIsSubmitting(true);
    setStatus("");

    try {
      await axios.post(`${API_BASE_URL}/messages`, {
        name: form.name,
        message: form.message
      });

      setForm({ name: "", message: "" });
      await fetchMessages();
      setStatus("Message posted.");
    } catch (error) {
      setStatus(error.response?.data?.message || "Unable to post your message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="guestbook-shell">
      <section className="hero-card">
        <div className="eyebrow">Live guest book</div>
        <h1>Write a note. Watch it appear in the feed.</h1>
        <p>
          Post a message from the form, save it to MongoDB, and keep the list in sync with a live refresh.
        </p>

        <div className="hero-meta">
          <span>{messages.length} messages</span>
          <span>{lastUpdated ? `Updated ${formatTimestamp(lastUpdated)}` : "Connecting to feed..."}</span>
        </div>
      </section>

      <section className="content-grid">
        <form className="composer panel" onSubmit={handleSubmit}>
          <div className="panel-header">
            <h2>Leave a message</h2>
            <p>Keep it short, warm, or memorable.</p>
          </div>

          <label className="field">
            <span>Name</span>
            <input
              name="name"
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </label>

          <label className="field">
            <span>Message</span>
            <textarea
              name="message"
              placeholder="Write something kind, funny, or thoughtful..."
              value={form.message}
              onChange={handleChange}
              rows={6}
            />
          </label>

          <button className="submit-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post message"}
          </button>

          <p className={`status ${status ? "visible" : ""}`} aria-live="polite">
            {status || "Messages refresh automatically every few seconds."}
          </p>
        </form>

        <section className="feed panel">
          <div className="panel-header">
            <h2>Message feed</h2>
            <p>Newest entries stay at the top.</p>
          </div>

          {isLoading ? (
            <div className="empty-state">Loading guest book entries...</div>
          ) : messages.length === 0 ? (
            <div className="empty-state">No messages yet. Be the first to sign the guest book.</div>
          ) : (
            <div className="message-list">
              {messages.map((entry) => (
                <article className="message-card" key={entry._id}>
                  <div className="message-topline">
                    <strong>{entry.name}</strong>
                    <span>{formatTimestamp(entry.createdAt)}</span>
                  </div>
                  <p>{entry.message}</p>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

export default Guestbook;