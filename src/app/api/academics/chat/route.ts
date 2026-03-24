import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // In a real app, this would integrate with OpenAI or Gemini API.
    // Simulating an academic bot response for now:
    const keywords = ['course', 'policy', 'deadline', 'library', 'assignment'];
    const query = message.toLowerCase();
    
    let botResponse = `I found some helpful academic resources relating to your query. To assist you better, could you provide more specific details?`;
    
    if (query.includes('deadline')) {
      botResponse = "Upcoming deadlines can usually be found on your student portal's calendar tab. Do you need help navigating to it?";
    } else if (query.includes('library')) {
      botResponse = "The university library opens from 8 AM to 10 PM. You can find digital archives on the main university domain.";
    } else if (query.includes('course')) {
      botResponse = "Course registration happens twice a year. You can view your current enrolled courses in the student dashboard.";
    } else if (query.includes('policy')) {
      botResponse = "Academic policies require maintaining a minimum GPA to avoid probation. You can check the detailed syllabus or student handbook for more info.";
    }

    return NextResponse.json({ response: botResponse });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}