# GCSE Revision App

## Current State
New project. No existing backend or frontend code.

## Requested Changes (Diff)

### Add
- Home page listing all subjects with the ability to add new subjects (by name) and remove existing ones
- Subject detail page showing revision topics/notes for that subject, with ability to add and remove topics/notes
- Navigation: breadcrumb or back button from subject page to home
- Sample subjects pre-loaded (Maths, English, Biology) for demonstration

### Modify
N/A

### Remove
N/A

## Implementation Plan

### Backend (Motoko)
- `Subject` type: `{ id: Nat; name: Text }`
- `Topic` type: `{ id: Nat; subjectId: Nat; title: Text; notes: Text }`
- `addSubject(name: Text) -> Subject`
- `getSubjects() -> [Subject]`
- `removeSubject(id: Nat) -> Bool`
- `addTopic(subjectId: Nat, title: Text, notes: Text) -> Topic`
- `getTopics(subjectId: Nat) -> [Topic]`
- `removeTopic(id: Nat) -> Bool`

### Frontend (React + TypeScript)
- `HomePage`: grid of subject cards with add-subject form and delete button per card
- `SubjectPage`: list of topic/note cards with add-topic form (title + notes textarea) and delete per topic
- React Router for navigation between home and subject pages
- Student-friendly, clean UI
