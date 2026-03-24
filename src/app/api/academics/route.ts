import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import AcademicDoubt from '@/models/AcademicDoubt';
import AcademicFlashcard from '@/models/AcademicFlashcard';
import AcademicPoll from '@/models/AcademicPoll';
import AcademicNote from '@/models/AcademicNote';

export async function GET() {
  try {
    await dbConnect();
    
    // Seed dummy data if empty to avoid blank state for the user initially
    const doubtCount = await AcademicDoubt.countDocuments();
    if (doubtCount === 0) {
      await AcademicDoubt.insertMany([
        { title: 'How to solve differential equations?', course: 'Calculus', responses: 3, status: 'answered', time: '2 hours ago' },
        { title: 'Quantum mechanics: Uncertainty principle', course: 'Physics', responses: 0, status: 'pending', time: '30 mins ago' },
        { title: 'React hooks best practices', course: 'Web Dev', responses: 5, status: 'answered', time: '1 hour ago' },
      ]);
      await AcademicFlashcard.insertMany([
        { course: 'Chemistry', q: 'What is a catalyst?', a: 'Substance that increases reaction rate', mastery: 85 },
        { course: 'Biology', q: 'Mitochondria function', a: 'Energy production', mastery: 92 },
        { course: 'History', q: 'French Revolution', a: '1789', mastery: 100 },
      ]);
      await AcademicNote.insertMany([
        { title: 'Data Structures 101', course: 'CS', content: 'Arrays, Linked Lists, Trees, Graphs.' },
      ]);
      await AcademicPoll.insertMany([
        {
          question: 'Which is your preferred learning style?',
          options: [
            { label: 'Visual (Diagrams, Videos)', votes: 42 },
            { label: 'Hands-on (Coding, Projects)', votes: 38 },
            { label: 'Reading & Discussion', votes: 20 },
          ],
          totalVotes: 100,
          endDate: '2 days left',
        },
        {
          question: 'Should we have more group projects?',
          options: [
            { label: 'Yes, definitely!', votes: 67 },
            { label: 'Maybe, depends on subject', votes: 28 },
            { label: 'No, prefer individual work', votes: 5 },
          ],
          totalVotes: 100,
          endDate: '5 days left',
        }
      ]);
    }

    const doubts = await AcademicDoubt.find().sort({ createdAt: -1 }).lean();
    const flashcards = await AcademicFlashcard.find().sort({ createdAt: -1 }).lean();
    const notes = await AcademicNote.find().sort({ createdAt: -1 }).lean();
    const polls = await AcademicPoll.find().sort({ createdAt: -1 }).lean();

    return NextResponse.json({ doubts, flashcards, notes, polls });
  } catch (error) {
    console.error('Academics fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    const { type, payload } = body;

    let result;
    if (type === 'doubt') {
      result = await AcademicDoubt.create(payload);
    } else if (type === 'flashcard') {
      result = await AcademicFlashcard.create(payload);
    } else if (type === 'note') {
      result = await AcademicNote.create(payload);
    } else if (type === 'poll') {
      // Ensure basic structure logic
      const options = payload.options.map((opt: string) => ({ label: opt, votes: 0 }));
      result = await AcademicPoll.create({
        question: payload.question,
        options,
        totalVotes: 0,
        endDate: '7 days left'
      });
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Academics create error:', error);
    return NextResponse.json({ error: 'Failed to create item' }, { status: 500 });
  }
}
