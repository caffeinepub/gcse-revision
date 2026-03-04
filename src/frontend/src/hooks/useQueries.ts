import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Subject, SubjectId, Topic, TopicId } from "../backend.d";
import { useActor } from "./useActor";

// ── Subjects ──────────────────────────────────────────────────────────────────

export function useSubjects() {
  const { actor, isFetching } = useActor();
  return useQuery<Subject[]>({
    queryKey: ["subjects"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listSubjects();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("No actor");
      return actor.addSubject(name);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

export function useRemoveSubject() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (subjectId: SubjectId) => {
      if (!actor) throw new Error("No actor");
      return actor.removeSubject(subjectId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["subjects"] }),
  });
}

// ── Topics ────────────────────────────────────────────────────────────────────

export function useTopics(subjectId: SubjectId | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<Topic[]>({
    queryKey: ["topics", subjectId?.toString()],
    queryFn: async () => {
      if (!actor || subjectId === undefined) return [];
      return actor.listTopicsForSubject(subjectId);
    },
    enabled: !!actor && !isFetching && subjectId !== undefined,
  });
}

export function useAddTopic() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      title,
      notes,
    }: {
      subjectId: SubjectId;
      title: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addTopic(subjectId, title, notes);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["topics", vars.subjectId.toString()] }),
  });
}

export function useRemoveTopic() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      topicId,
    }: {
      topicId: TopicId;
      subjectId: SubjectId;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.removeTopic(topicId);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["topics", vars.subjectId.toString()] }),
  });
}
