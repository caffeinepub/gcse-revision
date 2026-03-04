# GCSE Revision

## Current State

Each subject page has a single image that can be uploaded and displayed below the subject heading. Topics are collapsible cards with sub-topics, notes, and a "mark as learned" toggle. There is no image support at the topic level.

## Requested Changes (Diff)

### Add
- `TopicImage` type in backend: `{ id: TopicImageId; topicId: TopicId; blob: ExternalBlob }`
- `nextTopicImageId` counter and `topicImageStore` stable array in backend
- `addTopicImage(topicId, blob)` -> `TopicImageId` backend function
- `listTopicImages(topicId)` -> `[TopicImage]` backend function
- `removeTopicImage(topicImageId)` backend function
- Frontend hooks: `useTopicImages`, `useAddTopicImage`, `useRemoveTopicImage`
- Within each expanded topic card: a horizontal scrollable image strip showing all uploaded images
- An upload button/dropzone inside each expanded topic to add more images
- A delete (X) button on each image thumbnail in the strip
- A click-to-enlarge dialog for each individual topic image

### Modify
- `backend.d.ts` -- add `TopicImage`, `TopicImageId`, and three new backend methods
- `useQueries.ts` -- add three new hooks for topic images
- `SubjectPage.tsx` -- render image strip and upload UI inside the expanded topic body

### Remove
- Nothing removed
