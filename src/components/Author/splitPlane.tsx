import React, { useRef, useState, useEffect } from 'react';

export default function SplitPane({
  minLeft = 400,   // px
  minRight = 400,  // px
  initialLeft = 0.5, // fraction of container
  children,        // [leftContent, rightContent]
} : {
  minLeft?: number;
  minRight?: number;
  initialLeft?: number;
  children: React.ReactNode[];
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftWidth, setLeftWidth] = useState<number | null>(null);
  const startX = useRef(0);
  const startLeftWidth = useRef(0);

  // on mount, set initial width
  useEffect(() => {
    const container = containerRef.current;
    if (container && leftWidth === null) {
      setLeftWidth(container.clientWidth * initialLeft);
    }
  }, [initialLeft, leftWidth]);

  // Handle drag events
  const onDragStart = (e) => {
    e.preventDefault();
    startX.current = e.touches ? e.touches[0].pageX : e.pageX;
    startLeftWidth.current = leftWidth ?? 0;
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', onDragEnd);
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('touchend', onDragEnd);
  };

  const onDrag = (e) => {
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].pageX : e.pageX;
    const dx = clientX - startX.current;
    const container = containerRef.current;
    if (!container) return;

    const maxLeft = container.clientWidth - minRight - 4; // 4px for the handle
    let newLeft = startLeftWidth.current + dx;
    newLeft = Math.max(newLeft, minLeft);
    newLeft = Math.min(newLeft, maxLeft);

    setLeftWidth(newLeft);
  };

  const onDragEnd = () => {
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', onDragEnd);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('touchend', onDragEnd);
  };

  const [leftContent, rightContent] = React.Children.toArray(children);

  return (
    <div
      ref={containerRef}
      className="flex w-full h-full overflow-hidden select-none gap-5"
    >
      {/* Left pane */}
      <div
        className="overflow-auto"
        style={{ flex: `0 0 ${leftWidth}px`, minWidth: `${minLeft}px` }}
      >
        {leftContent}
      </div>

      {/* Drag handle */}
      <div
        className="w-1 cursor-col-resize bg-gray-100 hover:bg-gray-200"
        onMouseDown={onDragStart}
        onTouchStart={onDragStart}
      />

      {/* Right pane */}
      <div
        className="flex-1 overflow-auto"
        style={{ minWidth: `${minRight}px` }}
      >
        {rightContent}
      </div>
    </div>
  );
}
