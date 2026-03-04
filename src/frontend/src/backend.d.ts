import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Topic {
    id: TopicId;
    title: string;
    subjectId: SubjectId;
    notes: string;
}
export type TopicId = bigint;
export type SubjectId = bigint;
export interface Subject {
    id: SubjectId;
    name: string;
}
export interface backendInterface {
    addSubject(name: string): Promise<SubjectId>;
    addTopic(subjectId: SubjectId, title: string, notes: string): Promise<TopicId>;
    listSubjects(): Promise<Array<Subject>>;
    listTopicsForSubject(subjectId: SubjectId): Promise<Array<Topic>>;
    removeSubject(subjectId: SubjectId): Promise<void>;
    removeTopic(topicId: TopicId): Promise<void>;
}
