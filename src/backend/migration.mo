import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Storage "blob-storage/Storage";

module {
  type SubjectId = Nat;
  type TopicId = Nat;
  type SubTopicId = Nat;
  type PastPaperId = Nat;
  type TopicImageId = Nat;

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

  // Old actor type without topic images
  type OldActor = {
    var nextSubjectId : Nat;
    var nextTopicId : Nat;
    var nextSubTopicId : Nat;
    var nextPastPaperId : Nat;
    var subjectStore : [Subject];
    var topicStore : [Topic];
    var subTopicStore : [SubTopic];
    var pastPaperStore : [PastPaper];
  };

  type TopicImage = {
    id : TopicImageId;
    topicId : TopicId;
    blob : Storage.ExternalBlob;
  };

  // New actor type with topic images
  type NewActor = {
    var nextSubjectId : Nat;
    var nextTopicId : Nat;
    var nextSubTopicId : Nat;
    var nextPastPaperId : Nat;
    var nextTopicImageId : Nat;
    var subjectStore : [Subject];
    var topicStore : [Topic];
    var subTopicStore : [SubTopic];
    var pastPaperStore : [PastPaper];
    var topicImageStore : [TopicImage];
  };

  // Migration function
  public func run(old : OldActor) : NewActor {
    {
      var nextSubjectId = old.nextSubjectId;
      var nextTopicId = old.nextTopicId;
      var nextSubTopicId = old.nextSubTopicId;
      var nextPastPaperId = old.nextPastPaperId;
      var nextTopicImageId = 1 : Nat; // Initialize to 1 since we have no images yet
      var subjectStore = old.subjectStore;
      var topicStore = old.topicStore;
      var subTopicStore = old.subTopicStore;
      var pastPaperStore = old.pastPaperStore;
      var topicImageStore = [] : [TopicImage]; // Empty array since no images yet
    };
  };
};
