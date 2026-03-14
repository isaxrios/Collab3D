import { useState, useCallback } from 'react';
import LeftDashboard from './components/LeftDashboard';
import VideoPlayer from './components/VideoPlayer';
import CommentsPanel from './components/CommentsPanel';
import basketballVid from './assets/basketball-vid.mp4';
import './App.css';

const INITIAL_COMMENTS = [
  { id: 1, author: 'Kate Andrews', time: 10, text: 'Consider color correction — create more contrast.', attachment: 'color_reference-02.jpg', resolved: false, replies: [] },
  { id: 2, author: 'Edvin Besic', time: 15, text: 'The suit blends in too much. Stronger blacks for separation.', resolved: true, replies: [{ id: 'r1', author: 'Yuki Tanaka', text: "Right on, I'll have that update by EOD." }] },
];

export default function App() {
  const [comments, setComments] = useState(INITIAL_COMMENTS);
  const [currentTime, setCurrentTime] = useState(0);
  const [seekToTime, setSeekToTime] = useState(null);

  const commentTimes = comments.map((c) => c.time).filter((t) => Number.isFinite(t));

  const handleSeekDone = useCallback(() => setSeekToTime(null), []);
  const handleSeekTo = useCallback((time) => setSeekToTime(time), []);

  return (
    <div className="app-layout">
      <LeftDashboard />
      <div className="main-content">
        <VideoPlayer
          videoSrc={basketballVid}
          videoLabel="Scene Selects / basketball-vid.mp4"
          commentTimes={commentTimes}
          onTimeClick={handleSeekTo}
          seekToTime={seekToTime}
          onSeekDone={handleSeekDone}
          onTimeUpdate={setCurrentTime}
        />
        <CommentsPanel
          currentTime={currentTime}
          comments={comments}
          onCommentsChange={setComments}
          onSeekTo={handleSeekTo}
        />
      </div>
    </div>
  );
}
