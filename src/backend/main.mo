import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Array "mo:core/Array";

actor {
  include MixinStorage();

  type SubjectId = Nat;
  type TopicId = Nat;
  type SubTopicId = Nat;
  type PastPaperId = Nat;

  type Subject = {
    id : SubjectId;
    name : Text;
    image : ?Storage.ExternalBlob;
  };

  type Topic = {
    id : TopicId;
    subjectId : SubjectId;
    title : Text;
    notes : Text;
  };

  type SubTopic = {
    id : SubTopicId;
    topicId : TopicId;
    heading : Text;
    notes : Text;
  };

  type PastPaper = {
    id : PastPaperId;
    subjectId : SubjectId;
    title : Text;
    year : ?Nat;
    notes : Text;
  };

  var nextSubjectId = 1;
  var nextTopicId = 1;
  var nextSubTopicId = 1;
  var nextPastPaperId = 1;

  let subjects = Map.empty<SubjectId, Subject>();
  let topics = Map.empty<TopicId, Topic>();
  let subTopics = Map.empty<SubTopicId, SubTopic>();
  let pastPapers = Map.empty<PastPaperId, PastPaper>();

  // Subject Management
  public shared ({ caller }) func addSubject(name : Text) : async SubjectId {
    let subject : Subject = {
      id = nextSubjectId;
      name;
      image = null;
    };
    subjects.add(nextSubjectId, subject);

    nextSubjectId += 1;
    subject.id;
  };

  public shared ({ caller }) func setSubjectImage(subjectId : SubjectId, blob : Storage.ExternalBlob) : async () {
    switch (subjects.get(subjectId)) {
      case (null) { () };
      case (?subject) {
        let updatedSubject = { subject with image = ?blob };
        subjects.add(subjectId, updatedSubject);
      };
    };
  };

  public query ({ caller }) func getSubjectImage(subjectId : SubjectId) : async ?Storage.ExternalBlob {
    switch (subjects.get(subjectId)) {
      case (null) { null };
      case (?subject) { subject.image };
    };
  };

  public query ({ caller }) func listSubjects() : async [Subject] {
    let entries = subjects.toArray();
    entries.map(func((id, subject)) { subject });
  };

  public shared ({ caller }) func removeSubject(subjectId : SubjectId) : async () {
    subjects.remove(subjectId);
  };

  // Topic Management
  public shared ({ caller }) func addTopic(subjectId : SubjectId, title : Text, notes : Text) : async TopicId {
    if (not subjects.containsKey(subjectId)) {
      return nextTopicId;
    };

    let topic : Topic = {
      id = nextTopicId;
      subjectId;
      title;
      notes;
    };
    topics.add(nextTopicId, topic);

    nextTopicId += 1;
    topic.id;
  };

  public query ({ caller }) func listTopicsForSubject(subjectId : SubjectId) : async [Topic] {
    let allTopics = topics.toArray();
    allTopics.map(func((id, topic)) { topic });
  };

  public shared ({ caller }) func removeTopic(topicId : TopicId) : async () {
    topics.remove(topicId);
  };

  // SubTopic Management
  public shared ({ caller }) func addSubTopic(topicId : TopicId, heading : Text, notes : Text) : async SubTopicId {
    if (not topics.containsKey(topicId)) {
      return nextSubTopicId;
    };

    let subTopic : SubTopic = {
      id = nextSubTopicId;
      topicId;
      heading;
      notes;
    };
    subTopics.add(nextSubTopicId, subTopic);

    nextSubTopicId += 1;
    subTopic.id;
  };

  public shared ({ caller }) func updateSubTopicNotes(subTopicId : SubTopicId, notes : Text) : async () {
    switch (subTopics.get(subTopicId)) {
      case (null) { () };
      case (?subTopic) {
        let updatedSubTopic = { subTopic with notes };
        subTopics.add(subTopicId, updatedSubTopic);
      };
    };
  };

  public query ({ caller }) func listSubTopicsForTopic(topicId : TopicId) : async [SubTopic] {
    let allSubTopics = subTopics.toArray();
    allSubTopics.map(func((id, subTopic)) { subTopic });
  };

  public shared ({ caller }) func removeSubTopic(subTopicId : SubTopicId) : async () {
    subTopics.remove(subTopicId);
  };

  // Past Paper Management
  public shared ({ caller }) func addPastPaper(subjectId : SubjectId, title : Text, year : ?Nat, notes : Text) : async PastPaperId {
    if (not subjects.containsKey(subjectId)) {
      return nextPastPaperId;
    };

    let pastPaper : PastPaper = {
      id = nextPastPaperId;
      subjectId;
      title;
      year;
      notes;
    };
    pastPapers.add(nextPastPaperId, pastPaper);

    nextPastPaperId += 1;
    pastPaper.id;
  };

  public query ({ caller }) func listPastPapersForSubject(subjectId : SubjectId) : async [PastPaper] {
    let allPapers = pastPapers.toArray();
    allPapers.map(func((id, pastPaper)) { pastPaper });
  };

  public shared ({ caller }) func removePastPaper(pastPaperId : PastPaperId) : async () {
    pastPapers.remove(pastPaperId);
  };

  public shared ({ caller }) func updatePastPaperNotes(pastPaperId : PastPaperId, notes : Text) : async () {
    switch (pastPapers.get(pastPaperId)) {
      case (null) { () };
      case (?pastPaper) {
        let updatedPastPaper = { pastPaper with notes };
        pastPapers.add(pastPaperId, updatedPastPaper);
      };
    };
  };
};
