import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Fallback responses based on mood and stress levels
const getFallbackResponse = (message: string, moodLevel: number, stressLevel: number): string => {
  const userMessage = message.toLowerCase();
  const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];

  // Check for specific keywords
  if (userMessage.includes('help') || userMessage.includes('emergency') || userMessage.includes('harm')) {
    return '❤️ I\'m concerned about what you\'re sharing. Please reach out to a counselor or crisis helpline. Your wellbeing matters! Would you like me to provide some resources? In the meantime, try some deep breathing exercises.';
  }

  if (userMessage.includes('anxious') || userMessage.includes('worry') || userMessage.includes('nervous')) {
    return '💙 Anxiety is tough. Try the 5-4-3-2-1 grounding technique: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This can help calm your nervous system. Want to try a breathing exercise together?';
  }

  if (userMessage.includes('sad') || userMessage.includes('depressed') || userMessage.includes('down')) {
    return '💚 I hear you. Feeling down is valid. Small things can help: a short walk, talking to someone you trust, or listening to uplifting music. You\'re not alone in this. What\'s one small thing that usually makes you feel better?';
  }

  if (userMessage.includes('sleep') || userMessage.includes('tired') || userMessage.includes('exhausted')) {
    return '😴 Sleep is SO important for your mental health. Try: putting away your phone 30 mins before bed, a consistent sleep schedule, and keeping your room cool. Even 15 mins of wind-down time helps. How\'s your sleep routine?';
  }

  if (userMessage.includes('exercise') || userMessage.includes('workout') || userMessage.includes('gym')) {
    return '🏃 Movement is a mood-booster! Even a 10-minute walk can improve your mental health. You don\'t need to do intense workouts - gentle stretching or dancing to your favorite song work great too. What\'s an activity you enjoy?';
  }

  if (userMessage.includes('study') || userMessage.includes('exam') || userMessage.includes('test')) {
    return '📚 Academic stress is real! Try the Pomodoro technique: 25 mins focused study, 5 mins break. Break big tasks into smaller chunks. Remember, you\'re doing your best! Want tips on dealing with exam anxiety?';
  }

  if (userMessage.includes('friend') || userMessage.includes('relationship') || userMessage.includes('social')) {
    return '👥 Social connections matter for our mental health. Even a quick chat with someone you care about can lift your mood. If socializing feels hard right now, that\'s okay too. You can start small - even texting a friend helps!';
  }

  // Stress-based responses
  if (stressLevel > 7) {
    return `🌡️ Your stress level is high - that\'s important to address. Quick calming technique: Breathe in for 4 counts, hold for 4, out for 6. Do this 5 times. Also consider talking to someone - a friend, family, or counselor. You deserve support. What\'s causing most of the stress right now?`;
  }

  if (stressLevel > 5) {
    return `💙 You\'re carrying some stress. Let\'s work on it together. Journaling, exercise, or talking it out can help. What\'s one thing you can do today to feel even 1% better?`;
  }

  // Mood-based responses
  if (moodLevel === 0) {
    return '💜 I see you\'re really struggling right now. Please know you\'re not alone, and it\'s okay to ask for help. Reach out to someone you trust - a friend, family member, or counselor. You deserve care and support.';
  }

  if (moodLevel === 1) {
    return '💙 I\'m here for you. Even when things feel really hard, small steps help - drinking water, getting sunlight, or talking to someone. What\'s one thing that usually helps you feel a bit better?';
  }

  if (moodLevel === 3) {
    return '😊 Neutral is normal. You might be between things right now. Some interesting self-care ideas: try a new hobby, connect with someone, or just rest if you need it. How are you doing really?';
  }

  if (moodLevel === 4) {
    return '🌟 That\'s great! You\'re in a good place. Keep nurturing what\'s working for you. Share some of that positive energy with others - it\'s contagious! What\'s been going well?';
  }

  // Default supportive response
  const responses = [
    '💙 Thank you for sharing. I\'m here to listen. Tell me more about how you\'re feeling.',
    '🌟 I appreciate you opening up. What\'s on your mind?',
    '💚 Your wellness matters. Let\'s talk through what you\'re experiencing.',
    '🌈 I\'m here for support. What can I help you with today?',
    '💫 You\'re doing important work taking care of your mental health. What would help right now?',
  ];

  return responses[Math.floor(Math.random() * responses.length)];
};

export async function POST(request: NextRequest) {
  try {
    const { message, moodLevel, stressLevel, chatHistory } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Try Gemini API first
    try {
      // Format chat history for context
      const conversationContext = chatHistory
        .slice(-10) // Last 10 messages for context
        .map((msg: any) => `${msg.role === 'user' ? 'Student' : 'Wellness AI'}: ${msg.content}`)
        .join('\n');

      const moodLabels = ['Very Sad', 'Sad', 'Neutral', 'Happy', 'Very Happy'];
      const stressLabels = ['No Stress', 'Low', 'Moderate', 'High', 'Very High'];

      const systemPrompt = `You are a compassionate and supportive AI wellness mentor for students. You're having a conversation with a student about their mental health and wellbeing.

CURRENT WELLNESS STATUS:
- Mood: ${moodLabels[moodLevel] || 'Neutral'} (${moodLevel}/5)
- Stress Level: ${(stressLevel / 2).toFixed(1)}/5 (Raw: ${stressLevel}/10)

IMPORTANT GUIDELINES:
1. Be empathetic, supportive, and non-judgmental
2. Ask follow-up questions to understand their situation better
3. Provide practical, actionable advice when appropriate
4. Suggest wellness activities based on their current mood and stress
5. If they mention serious mental health concerns, encourage them to speak with a professional
6. Keep responses concise and conversational (2-3 sentences usually)
7. Use their mood/stress data to personalize your response
8. If stress is high (>7/10) or mood is low, gently suggest grounding techniques or speaking to a counselor

Previous conversation context:
${conversationContext || 'This is the start of the conversation'}`;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GEMINI_API_KEY || '',
        },
        body: JSON.stringify({
          system: systemPrompt,
          contents: [
            {
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Gemini API error:', error);
        
        // Check if it's a quota error
        if (error.error?.code === 429 || error.error?.status === 'RESOURCE_EXHAUSTED') {
          console.warn('Gemini API quota exceeded, using fallback responses');
          const fallbackResponse = getFallbackResponse(message, moodLevel, stressLevel);
          return NextResponse.json(
            { response: fallbackResponse, offline: true },
            { status: 200 }
          );
        }
        
        throw new Error('Gemini API failed');
      }

      const data = await response.json();
      const aiResponse = data.candidates[0].content.parts[0].text;

      return NextResponse.json({ response: aiResponse, offline: false }, { status: 200 });
    } catch (apiError) {
      // Fallback to pre-built responses
      console.warn('Falling back to offline responses:', apiError);
      const fallbackResponse = getFallbackResponse(message, moodLevel, stressLevel);
      return NextResponse.json(
        { response: fallbackResponse, offline: true },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
