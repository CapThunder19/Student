import { NextRequest, NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Fallback wellness recommendations
const getFallbackRecommendations = (mood: number, stressLevel: number): string => {
  const recommendations: Record<string, string[]> = {
    veryLowMoodHighStress: [
      '1. **Immediate Action**: Practice the 4-7-8 breathing technique (4 count in, 7 hold, 8 out). Do this 3 times right now.',
      '2. **Long-term Habit**: Establish a 10-minute daily meditation practice. Apps like Headspace or Calm can help you start.',
      '3. **Resource**: Consider talking to a counselor. Your university likely offers free mental health services.',
    ],
    lowMoodHighStress: [
      '1. **Immediate Action**: Take a 15-minute walk outside. Nature exposure significantly reduces stress and improves mood.',
      '2. **Long-term Habit**: Build a consistent sleep schedule - going to bed at the same time helps regulate your emotions.',
      '3. **Resource**: Try journaling for 5-10 minutes daily. Write freely without judgment - it helps process emotions.',
    ],
    neutralMoodModerateStress: [
      '1. **Immediate Action**: Do something fun you enjoy for 20 minutes - watch a show, play a game, or listen to music.',
      '2. **Long-term Habit**: Exercise 3 times a week. Even 20 mins of walking or yoga improves both mood and stress levels.',
      '3. **Resource**: Connect with friends. Social support is one of the best stress buffers available.',
    ],
    goodMoodLowStress: [
      '1. **Immediate Action**: Share your good mood with someone - compliment a friend or do a small act of kindness.',
      '2. **Long-term Habit**: Maintain your current routines - they\'re clearly working! Keep what\'s helping.',
      '3. **Resource**: Help others by being a peer listener. Teaching others builds emotional resilience.',
    ],
  };

  if (mood <= 1 && stressLevel > 7) {
    return recommendations.veryLowMoodHighStress.join('\n\n');
  } else if (mood <= 2 && stressLevel > 5) {
    return recommendations.lowMoodHighStress.join('\n\n');
  } else if (mood === 3 || stressLevel <= 5) {
    return recommendations.neutralMoodModerateStress.join('\n\n');
  } else {
    return recommendations.goodMoodLowStress.join('\n\n');
  }
};

export async function POST(request: NextRequest) {
  let mood: number = 3;
  let stressLevel: number = 2;
  
  try {
    const { mood: moodParam, stressLevel: stressParam, activities } = await request.json();
    mood = moodParam;
    stressLevel = stressParam;

    if (!mood || stressLevel === undefined) {
      return NextResponse.json(
        { error: 'Mood and stress level are required' },
        { status: 400 }
      );
    }

    const prompt = `You are a supportive wellness mentor for a student. Based on the following information, provide 3 specific, actionable wellness recommendations:

Mood: ${mood}/5 (where 1 is very sad and 5 is very happy)
Current Stress Level: ${stressLevel}/10
Recent Activities: ${activities || 'Not specified'}

Please provide:
1. One immediate action they can take right now (2-3 sentences)
2. One long-term habit to develop (2-3 sentences)
3. One resource or activity recommendation (2-3 sentences)

Keep the tone supportive, practical, and encouraging. Use markdown formatting with numbered points.`;

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY || '',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      
      // Check if it's a quota error - use fallback
      if (error.error?.code === 429 || error.error?.status === 'RESOURCE_EXHAUSTED') {
        console.warn('Gemini API quota exceeded, using fallback recommendations');
        const fallbackRecommendations = getFallbackRecommendations(mood, stressLevel);
        return NextResponse.json({ recommendations: fallbackRecommendations, offline: true }, { status: 200 });
      }
      
      return NextResponse.json(
        { error: 'Failed to generate recommendations' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const recommendations = data.candidates[0].content.parts[0].text;

    return NextResponse.json({ recommendations, offline: false }, { status: 200 });
  } catch (error) {
    console.error('Wellness recommendation error:', error);
    // Fallback on any error with default values if variables not set
    const fallbackRecommendations = getFallbackRecommendations(mood || 3, stressLevel || 2);
    return NextResponse.json(
      { recommendations: fallbackRecommendations, offline: true },
      { status: 200 }
    );
  }
}
