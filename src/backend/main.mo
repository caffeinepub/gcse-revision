import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";
import Nat "mo:core/Nat";

import Array "mo:core/Array";


actor {
  include MixinStorage();

  type SubjectId = Nat;
  type TopicId = Nat;
  type SubTopicId = Nat;
  type PastPaperId = Nat;
  type SubjectImageId = Nat;

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

  type SubjectImageEntry = {
    id : SubjectImageId;
    subjectId : SubjectId;
    blob : Storage.ExternalBlob;
  };

  var nextSubjectId = 1;
  var nextTopicId = 1;
  var nextSubTopicId = 1;
  var nextPastPaperId = 1;
  var nextSubjectImageId = 1;

  var subjectStore : [Subject] = [];
  var topicStore : [Topic] = [];
  var subTopicStore : [SubTopic] = [];
  var pastPaperStore : [PastPaper] = [];
  var subjectImageStore : [SubjectImageEntry] = [];

  // Subject Management
  public shared ({ caller }) func addSubject(name : Text) : async SubjectId {
    let subject : Subject = {
      id = nextSubjectId;
      name;
      image = null;
    };
    subjectStore := subjectStore.concat([subject]);
    nextSubjectId += 1;
    subject.id;
  };

  // Legacy: sets primary subject image (keep for compatibility)
  public shared ({ caller }) func setSubjectImage(subjectId : SubjectId, blob : Storage.ExternalBlob) : async () {
    subjectStore := subjectStore.map(
      func(subject) {
        if (subject.id == subjectId) {
          { subject with image = ?blob };
        } else {
          subject;
        };
      }
    );

    // Also update first image entry in subjectImageStore for backwards compatibility
    let entriesForSubject = subjectImageStore.filter(func(entry) { entry.subjectId == subjectId });
    if (entriesForSubject.size() == 0) {
      let newEntry : SubjectImageEntry = {
        id = nextSubjectImageId;
        subjectId;
        blob;
      };
      subjectImageStore := subjectImageStore.concat([newEntry]);
      nextSubjectImageId += 1;
    } else {
      subjectImageStore := subjectImageStore.map(
        func(entry) {
          if (entry.subjectId == subjectId) {
            { entry with blob };
          } else {
            entry;
          };
        }
      );
    };
  };

  // Legacy: gets primary subject image (keep for compatibility)
  public query ({ caller }) func getSubjectImage(subjectId : SubjectId) : async ?Storage.ExternalBlob {
    switch (subjectStore.find(func(subject) { subject.id == subjectId })) {
      case (null) { null };
      case (?subject) { subject.image };
    };
  };

  public query ({ caller }) func listSubjects() : async [Subject] {
    subjectStore;
  };

  public shared ({ caller }) func removeSubject(subjectId : SubjectId) : async () {
    subjectStore := subjectStore.filter(
      func(subject) { subject.id != subjectId }
    );

    // Also remove all subject images for this subject
    subjectImageStore := subjectImageStore.filter(
      func(image) { image.subjectId != subjectId }
    );
  };

  // Multi-Image Support
  public shared ({ caller }) func addSubjectImage(subjectId : SubjectId, blob : Storage.ExternalBlob) : async SubjectImageId {
    let entry : SubjectImageEntry = {
      id = nextSubjectImageId;
      subjectId;
      blob;
    };
    subjectImageStore := subjectImageStore.concat([entry]);
    nextSubjectImageId += 1;
    entry.id;
  };

  public query ({ caller }) func listSubjectImages(subjectId : SubjectId) : async [SubjectImageEntry] {
    subjectImageStore.filter(func(entry) { entry.subjectId == subjectId });
  };

  public shared ({ caller }) func removeSubjectImage(imageId : SubjectImageId) : async () {
    subjectImageStore := subjectImageStore.filter(
      func(entry) { entry.id != imageId }
    );
  };

  // Topic Management
  public shared ({ caller }) func addTopic(subjectId : SubjectId, title : Text, notes : Text) : async TopicId {
    let topic : Topic = {
      id = nextTopicId;
      subjectId;
      title;
      notes;
    };
    topicStore := topicStore.concat([topic]);
    nextTopicId += 1;
    topic.id;
  };

  public query ({ caller }) func listTopicsForSubject(subjectId : SubjectId) : async [Topic] {
    topicStore.filter(func(topic) { topic.subjectId == subjectId });
  };

  public shared ({ caller }) func removeTopic(topicId : TopicId) : async () {
    topicStore := topicStore.filter(
      func(topic) { topic.id != topicId }
    );
  };

  // SubTopic Management
  public shared ({ caller }) func addSubTopic(topicId : TopicId, heading : Text, notes : Text) : async SubTopicId {
    let subTopic : SubTopic = {
      id = nextSubTopicId;
      topicId;
      heading;
      notes;
    };
    subTopicStore := subTopicStore.concat([subTopic]);
    nextSubTopicId += 1;
    subTopic.id;
  };

  public shared ({ caller }) func updateSubTopicNotes(subTopicId : SubTopicId, notes : Text) : async () {
    subTopicStore := subTopicStore.map(
      func(subTopic) {
        if (subTopic.id == subTopicId) {
          { subTopic with notes };
        } else {
          subTopic;
        };
      }
    );
  };

  public query ({ caller }) func listSubTopicsForTopic(topicId : TopicId) : async [SubTopic] {
    subTopicStore.filter(func(subTopic) { subTopic.topicId == topicId });
  };

  public shared ({ caller }) func removeSubTopic(subTopicId : SubTopicId) : async () {
    subTopicStore := subTopicStore.filter(
      func(subTopic) { subTopic.id != subTopicId }
    );
  };

  // Past Paper Management
  public shared ({ caller }) func addPastPaper(subjectId : SubjectId, title : Text, year : ?Nat, notes : Text) : async PastPaperId {
    let pastPaper : PastPaper = {
      id = nextPastPaperId;
      subjectId;
      title;
      year;
      notes;
    };
    pastPaperStore := pastPaperStore.concat([pastPaper]);
    nextPastPaperId += 1;
    pastPaper.id;
  };

  public query ({ caller }) func listPastPapersForSubject(subjectId : SubjectId) : async [PastPaper] {
    pastPaperStore.filter(func(paper) { paper.subjectId == subjectId });
  };

  public shared ({ caller }) func removePastPaper(pastPaperId : PastPaperId) : async () {
    pastPaperStore := pastPaperStore.filter(
      func(paper) { paper.id != pastPaperId }
    );
  };

  public shared ({ caller }) func updatePastPaperNotes(pastPaperId : PastPaperId, notes : Text) : async () {
    pastPaperStore := pastPaperStore.map(
      func(paper) {
        if (paper.id == pastPaperId) {
          { paper with notes };
        } else {
          paper;
        };
      }
    );
  };
};
