'use server'

import { Culture, Depense, Recette } from '@/lib/types'

export async function askAssistant(
  question: string,
  history: { role: 'user' | 'model'; text: string }[],
  context: { cultures: Culture[]; depenses: Depense[]; recettes: Recette[] },
  customApiKey?: string
) {
  // Priority: custom key > GROQ_API_KEY > GEMINI_API_KEY
  const groqKey = customApiKey?.startsWith('gsk_') ? customApiKey : process.env.GROQ_API_KEY
  const geminiKey = (!customApiKey?.startsWith('gsk_') && customApiKey) ? customApiKey : process.env.GEMINI_API_KEY

  if (!groqKey && !geminiKey) {
    return {
      error: 'API_KEY_MISSING',
      message: "Aucune clé API configurée. Ajoutez une clé Groq (gratuite sur console.groq.com) ou Gemini (gratuite sur aistudio.google.com) dans vos paramètres."
    }
  }

  const currentDate = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  const systemPrompt = `Vous êtes l'assistant IA intelligent de "Farm Mangane", une application mobile de gestion de ferme agricole.
Votre rôle est d'aider l'agriculteur à comprendre ses finances (dépenses et recettes) et ses cultures.

Voici les données actuelles de la ferme (format JSON) :
- Cultures : ${JSON.stringify(context.cultures)}
- Dépenses : ${JSON.stringify(context.depenses)}
- Recettes (Ventes) : ${JSON.stringify(context.recettes)}

Date actuelle de l'utilisateur : ${currentDate}

Instructions strictes :
1. Répondez de manière chaleureuse, polie, claire et très concise en français. Pas de grands discours inutiles.
2. Pour toute question sur les chiffres (ex: dépenses de la semaine, recettes de ce mois, culture qui a le record de ventes), vous DEVEZ faire les calculs mathématiques exacts en utilisant les données JSON ci-dessus.
3. Formatez toujours les montants monétaires en FCFA de façon lisible (ex: 25 000 FCFA).
4. Pour les questions de temps : "Cette semaine" désigne la semaine en cours de la date actuelle (commence le lundi). "Ce mois" désigne le mois de la date actuelle.
5. Associez les dépenses et recettes aux cultures via le champ "culture_id" correspondant à l'"id" d'une culture.
6. Si l'utilisateur demande "quelle culture a le record de vente", calculez la somme totale des recettes par culture et affichez la gagnante avec son montant.
7. Si une donnée n'est pas disponible, expliquez-le gentiment sans inventer de chiffres.`

  // Try Groq first (free, fast, llama-3.1-70b)
  if (groqKey) {
    try {
      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : 'user',
          content: msg.text
        })),
        { role: 'user', content: question }
      ]

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages,
          temperature: 0.1,
          max_tokens: 1000
        }),
        cache: 'no-store'
      })

      if (response.ok) {
        const data = await response.json()
        const text = data.choices?.[0]?.message?.content || "Réponse vide de l'IA."
        return { text, provider: 'groq' }
      }

      // If Groq fails with auth error, fall through to Gemini
      const errData = await response.json().catch(() => ({}))
      console.warn('Groq error, trying Gemini fallback:', errData)
      if (!geminiKey) {
        return {
          error: 'API_ERROR',
          message: "Erreur Groq. Vérifiez votre clé API sur console.groq.com."
        }
      }
    } catch (err) {
      console.warn('Groq network error, trying Gemini fallback:', err)
      if (!geminiKey) {
        return {
          error: 'SERVER_ERROR',
          message: "Erreur réseau lors de l'appel à Groq."
        }
      }
    }
  }

  // Fallback: Gemini
  if (geminiKey) {
    try {
      const contents = [
        ...history.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        })),
        { role: 'user', parts: [{ text: question }] }
      ]

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: systemPrompt }] },
            generationConfig: { temperature: 0.1, maxOutputTokens: 1000 }
          }),
          cache: 'no-store'
        }
      )

      if (!response.ok) {
        return {
          error: 'API_ERROR',
          message: "Erreur Gemini. Vérifiez votre clé API sur aistudio.google.com."
        }
      }

      const resData = await response.json()
      const text = resData.candidates?.[0]?.content?.parts?.[0]?.text || "Réponse vide."
      return { text, provider: 'gemini' }
    } catch (err) {
      console.error('Gemini error:', err)
      return { error: 'SERVER_ERROR', message: "Erreur serveur lors de l'appel à l'IA." }
    }
  }

  return { error: 'SERVER_ERROR', message: "Erreur inconnue." }
}
