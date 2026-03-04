import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type SubjectImageId = bigint;
export type PastPaperId = bigint;
export type TopicId = bigint;
export interface SubjectImageEntry {
    id: SubjectImageId;
    blob: ExternalBlob;
    subjectId: SubjectId;
}
export interface PastPaper {
    id: PastPaperId;
    title: string;
    year?: bigint;
    subjectId: SubjectId;
    notes: string;
}
export type SubTopicId = bigint;
export interface Topic {
    id: TopicId;
    title: string;
    subjectId: SubjectId;
    notes: string;
}
export interface SubTopic {
    id: SubTopicId;
    heading: string;
    notes: string;
    topicId: TopicId;
}
export type SubjectId = bigint;
export interface Subject {
    id: SubjectId;
    name: string;
    image?: ExternalBlob;
}
export interface backendInterface {
    addPastPaper(subjectId: SubjectId, title: string, year: bigint | null, notes: string): Promise<PastPaperId>;
    addSubTopic(topicId: TopicId, heading: string, notes: string): Promise<SubTopicId>;
    addSubject(name: string): Promise<SubjectId>;
    addSubjectImage(subjectId: SubjectId, blob: ExternalBlob): Promise<SubjectImageId>;
    addTopic(subjectId: SubjectId, title: string, notes: string): Promise<TopicId>;
    getSubjectImage(subjectId: SubjectId): Promise<ExternalBlob | null>;
    listPastPapersForSubject(subjectId: SubjectId): Promise<Array<PastPaper>>;
    listSubTopicsForTopic(topicId: TopicId): Promise<Array<SubTopic>>;
    listSubjectImages(subjectId: SubjectId): Promise<Array<SubjectImageEntry>>;
    listSubjects(): Promise<Array<Subject>>;
    listTopicsForSubject(subjectId: SubjectId): Promise<Array<Topic>>;
    removePastPaper(pastPaperId: PastPaperId): Promise<void>;
    removeSubTopic(subTopicId: SubTopicId): Promise<void>;
    removeSubject(subjectId: SubjectId): Promise<void>;
    removeSubjectImage(imageId: SubjectImageId): Promise<void>;
    removeTopic(topicId: TopicId): Promise<void>;
    setSubjectImage(subjectId: SubjectId, blob: ExternalBlob): Promise<void>;
    updatePastPaperNotes(pastPaperId: PastPaperId, notes: string): Promise<void>;
    updateSubTopicNotes(subTopicId: SubTopicId, notes: string): Promise<void>;
}
