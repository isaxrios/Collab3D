import { useState } from 'react';
import './CommentsPanel.css';

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const DEFAULT_COMMENTS = [
  { id: 1, author: 'Kate Andrews', time: 10, text: 'Consider color correction — create more contrast.', attachment: 'color_reference-02.jpg', resolved: false, replies: [] },
  { id: 2, author: 'Edvin Besic', time: 15, text: 'The suit blends in too much. Stronger blacks for separation.', resolved: true, replies: [{ id: 'r1', author: 'Yuki Tanaka', text: "Right on, I'll have that update by EOD." }] },
];

export default function CommentsPanel({ currentTime = 0, comments: controlledComments, onCommentsChange, onSeekTo }) {
  const [internalComments, setInternalComments] = useState(DEFAULT_COMMENTS);
  const [activeTab, setActiveTab] = useState('comments');
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const comments = controlledComments ?? internalComments;
  const setComments = onCommentsChange ?? setInternalComments;

  const addComment = () => {
    const text = (replyTo ? replyText : newComment).trim();
    if (!text) return;
    if (replyTo) {
      setComments(comments.map((c) =>
        c.id === replyTo.id
          ? { ...c, replies: [...(c.replies || []), { id: 'r' + Date.now(), author: 'You', text }] }
          : c
      ));
      setReplyTo(null);
      setReplyText('');
    } else {
      setComments([...comments, { id: Date.now(), author: 'You', time: currentTime, text, resolved: false, replies: [] }]);
      setNewComment('');
    }
  };

  return (
    <aside className="comments-panel">
      <div className="comments-tabs">
        <button className={activeTab === 'comments' ? 'active' : ''} onClick={() => setActiveTab('comments')}>Comments</button>
        <button className={activeTab === 'fields' ? 'active' : ''} onClick={() => setActiveTab('fields')}>Fields</button>
      </div>

      {activeTab === 'comments' && (
        <>
          <div className="comments-toolbar">
            <select className="comments-filter" aria-label="Filter comments">
              <option>All comments</option>
            </select>
            <div className="toolbar-actions">
              <button className="icon-btn" title="Filter" aria-label="Filter">⋮</button>
              <button className="icon-btn" title="Sort" aria-label="Sort">⇅</button>
              <button className="icon-btn" title="Search" aria-label="Search">⌕</button>
              <button className="icon-btn" title="More" aria-label="More">⋯</button>
            </div>
          </div>

          <div className="comments-list">
            {comments.map((c) => (
              <div key={c.id} className="comment-card">
                <div className="comment-header">
                  <button className="comment-time" onClick={() => onSeekTo?.(c.time)}>{formatTime(c.time)}</button>
                  <span className="comment-author">{c.author}</span>
                  {c.resolved && <span className="resolved-badge" title="Resolved">✓</span>}
                </div>
                <p className="comment-text">{c.text}</p>
                {c.attachment && (
                  <a href="#" className="comment-attachment" download>{c.attachment}</a>
                )}
                {(c.replies || []).map((r) => (
                  <div key={r.id} className="comment-reply">
                    <span className="comment-author">{r.author}</span>
                    <p className="comment-text">{r.text}</p>
                  </div>
                ))}
                {replyTo?.id === c.id ? (
                  <div className="reply-inline">
                    <input value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Write a reply..." onKeyDown={(e) => e.key === 'Enter' && addComment()} />
                    <button onClick={addComment}>Reply</button>
                    <button onClick={() => { setReplyTo(null); setReplyText(''); }}>Cancel</button>
                  </div>
                ) : (
                  <button className="reply-btn" onClick={() => setReplyTo(c)}>Reply</button>
                )}
                <span className="comment-id">#{c.id}</span>
              </div>
            ))}
          </div>

          <div className="comment-input-area">
            <div className="comment-input-row">
              <span className="input-time">{formatTime(currentTime)}</span>
              <input
                type="text"
                className="comment-input"
                placeholder="Leave your comment..."
                value={replyTo ? '' : newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addComment()}
                disabled={!!replyTo}
              />
            </div>
            <div className="comment-input-actions">
              <button className="icon-btn" title="Attach file" aria-label="Attach">📎</button>
              <button className="icon-btn" title="Emoji" aria-label="Emoji">😀</button>
              <select className="visibility-select" aria-label="Visibility">
                <option>Public</option>
              </select>
            </div>
          </div>
        </>
      )}

      {activeTab === 'fields' && (
        <div className="fields-placeholder">
          <p>Custom fields for feedback metadata.</p>
        </div>
      )}
    </aside>
  );
}
