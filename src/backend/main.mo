import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Order "mo:core/Order";

actor {
  type SubjectId = Nat;
  type TopicId = Nat;

  type Subject = {
    id : SubjectId;
    name : Text;
  };

  module Subject {
    public func compare(subject1 : Subject, subject2 : Subject) : Order.Order {
      compareById(subject1, subject2);
    };
    public func compareById(subject1 : Subject, subject2 : Subject) : Order.Order {
      Nat.compare(subject1.id, subject2.id);
    };
    public func compareByName(subject1 : Subject, subject2 : Subject) : Order.Order {
      Text.compare(subject1.name, subject2.name);
    };
  };

  type Topic = {
    id : TopicId;
    subjectId : SubjectId;
    title : Text;
    notes : Text;
  };

  module Topic {
    public func compare(topic1 : Topic, topic2 : Topic) : Order.Order {
      compareById(topic1, topic2);
    };
    public func compareById(topic1 : Topic, topic2 : Topic) : Order.Order {
      Nat.compare(topic1.id, topic2.id);
    };
    public func compareByTitle(topic1 : Topic, topic2 : Topic) : Order.Order {
      Text.compare(topic1.title, topic2.title);
    };
  };

  var nextSubjectId = 4 : Nat;
  var nextTopicId = 1 : Nat;

  let subjects = Map.empty<SubjectId, Subject>();
  let topics = Map.empty<TopicId, Topic>();

  // Pre-populate with initial subjects
  subjects.add(1, { id = 1; name = "Maths" });
  subjects.add(2, { id = 2; name = "English" });
  subjects.add(3, { id = 3; name = "Biology" });

  public shared ({ caller }) func addSubject(name : Text) : async SubjectId {
    let subject : Subject = {
      id = nextSubjectId;
      name;
    };
    subjects.add(nextSubjectId, subject);

    nextSubjectId += 1;

    subject.id;
  };

  public query ({ caller }) func listSubjects() : async [Subject] {
    subjects.values().toArray().sort();
  };

  public shared ({ caller }) func removeSubject(subjectId : SubjectId) : async () {
    switch (subjects.get(subjectId)) {
      case (null) { Runtime.trap("Subject with id " # subjectId.toText() # " does not exist.") };
      case (?_subject) { subjects.remove(subjectId) };
    };
  };

  public shared ({ caller }) func addTopic(subjectId : SubjectId, title : Text, notes : Text) : async TopicId {
    switch (subjects.get(subjectId)) {
      case (null) { Runtime.trap("Subject with id " # subjectId.toText() # " does not exist.") };
      case (?_subject) {
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
    };
  };

  public query ({ caller }) func listTopicsForSubject(subjectId : SubjectId) : async [Topic] {
    switch (subjects.get(subjectId)) {
      case (null) { Runtime.trap("Subject with id " # subjectId.toText() # " does not exist.") };
      case (?_subject) {
        topics.values().toArray().filter(
          func(topic) { topic.subjectId == subjectId }
        ).sort();
      };
    };
  };

  public shared ({ caller }) func removeTopic(topicId : TopicId) : async () {
    switch (topics.get(topicId)) {
      case (null) { Runtime.trap("Topic with id " # topicId.toText() # " does not exist.") };
      case (?_topic) { topics.remove(topicId) };
    };
  };
};
