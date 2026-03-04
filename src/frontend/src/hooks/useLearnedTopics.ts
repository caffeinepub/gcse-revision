import { useCallback, useEffect, useState } from "react";

function storageKey(subjectId: bigint) {
  return `learned_topics_${subjectId.toString()}`;
}

function loadFromStorage(subjectId: bigint): Set<string> {
  try {
    const raw = localStorage.getItem(storageKey(subjectId));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveToStorage(subjectId: bigint, ids: Set<string>) {
  try {
    localStorage.setItem(
      storageKey(subjectId),
      JSON.stringify(Array.from(ids)),
    );
  } catch {
    // Storage might be unavailable
  }
}

export function useLearnedTopics(subjectId: bigint) {
  const [learnedIds, setLearnedIds] = useState<Set<string>>(() =>
    loadFromStorage(subjectId),
  );

  // Reload if subjectId changes
  useEffect(() => {
    setLearnedIds(loadFromStorage(subjectId));
  }, [subjectId]);

  const toggleLearned = useCallback(
    (topicId: bigint) => {
      setLearnedIds((prev) => {
        const key = topicId.toString();
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        saveToStorage(subjectId, next);
        return next;
      });
    },
    [subjectId],
  );

  const isLearned = useCallback(
    (topicId: bigint) => learnedIds.has(topicId.toString()),
    [learnedIds],
  );

  return { learnedIds, toggleLearned, isLearned };
}
