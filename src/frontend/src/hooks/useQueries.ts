import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ExternalBlob } from "../backend";
import type {
  PastPaper,
  PastPaperId,
  SubTopic,
  SubTopicId,
  Subject,
  SubjectId,
  Topic,
  TopicId,
} from "../backend.d";
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

// ── Subject Images ─────────────────────────────────────────────────────────────

export function useSubjectImage(subjectId: SubjectId | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<ExternalBlob | null>({
    queryKey: ["subjectImage", subjectId?.toString()],
    queryFn: async () => {
      if (!actor || subjectId === undefined) return null;
      return actor.getSubjectImage(subjectId);
    },
    enabled: !!actor && !isFetching && subjectId !== undefined,
  });
}

export function useSetSubjectImage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      blob,
    }: {
      subjectId: SubjectId;
      blob: ExternalBlob;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.setSubjectImage(subjectId, blob);
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({
        queryKey: ["subjectImage", vars.subjectId.toString()],
      });
      qc.invalidateQueries({
        queryKey: ["subjectImages", vars.subjectId.toString()],
      });
    },
  });
}

// ── Multi-image per subject ────────────────────────────────────────────────────

import type { SubjectImageEntry, SubjectImageId } from "../backend.d";

export function useSubjectImages(subjectId: SubjectId | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<SubjectImageEntry[]>({
    queryKey: ["subjectImages", subjectId?.toString()],
    queryFn: async () => {
      if (!actor || subjectId === undefined) return [];
      return actor.listSubjectImages(subjectId);
    },
    enabled: !!actor && !isFetching && subjectId !== undefined,
  });
}

export function useAddSubjectImage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      blob,
    }: {
      subjectId: SubjectId;
      blob: ExternalBlob;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addSubjectImage(subjectId, blob);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["subjectImages", vars.subjectId.toString()],
      }),
  });
}

export function useRemoveSubjectImage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      imageId,
    }: {
      imageId: SubjectImageId;
      subjectId: SubjectId;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.removeSubjectImage(imageId);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["subjectImages", vars.subjectId.toString()],
      }),
  });
}

// ── SubTopics ──────────────────────────────────────────────────────────────────

export function useSubTopics(topicId: TopicId | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<SubTopic[]>({
    queryKey: ["subTopics", topicId?.toString()],
    queryFn: async () => {
      if (!actor || topicId === undefined) return [];
      return actor.listSubTopicsForTopic(topicId);
    },
    enabled: !!actor && !isFetching && topicId !== undefined,
  });
}

export function useAddSubTopic() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      topicId,
      heading,
      notes,
    }: {
      topicId: TopicId;
      heading: string;
      notes?: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addSubTopic(topicId, heading, notes ?? "");
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["subTopics", vars.topicId.toString()],
      }),
  });
}

export function useUpdateSubTopicNotes() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subTopicId,
      notes,
    }: {
      subTopicId: SubTopicId;
      notes: string;
      topicId: TopicId;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateSubTopicNotes(subTopicId, notes);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["subTopics", vars.topicId.toString()],
      }),
  });
}

export function useRemoveSubTopic() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subTopicId,
    }: {
      subTopicId: SubTopicId;
      topicId: TopicId;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.removeSubTopic(subTopicId);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["subTopics", vars.topicId.toString()],
      }),
  });
}

// ── Past Papers ────────────────────────────────────────────────────────────────

export function usePastPapers(subjectId: SubjectId | undefined) {
  const { actor, isFetching } = useActor();
  return useQuery<PastPaper[]>({
    queryKey: ["pastPapers", subjectId?.toString()],
    queryFn: async () => {
      if (!actor || subjectId === undefined) return [];
      return actor.listPastPapersForSubject(subjectId);
    },
    enabled: !!actor && !isFetching && subjectId !== undefined,
  });
}

export function useAddPastPaper() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      subjectId,
      title,
      year,
      notes,
    }: {
      subjectId: SubjectId;
      title: string;
      year: bigint | null;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addPastPaper(subjectId, title, year, notes);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["pastPapers", vars.subjectId.toString()],
      }),
  });
}

export function useRemovePastPaper() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pastPaperId,
    }: {
      pastPaperId: PastPaperId;
      subjectId: SubjectId;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.removePastPaper(pastPaperId);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["pastPapers", vars.subjectId.toString()],
      }),
  });
}

export function useUpdatePastPaperNotes() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      pastPaperId,
      notes,
    }: {
      pastPaperId: PastPaperId;
      notes: string;
      subjectId: SubjectId;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updatePastPaperNotes(pastPaperId, notes);
    },
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({
        queryKey: ["pastPapers", vars.subjectId.toString()],
      }),
  });
}
