import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ANTHROPIC_API_KEY } from '$env/static/private';
import Anthropic from '@anthropic-ai/sdk';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { image } = await request.json();

		if (!image) {
			return json({ error: 'No image provided' }, { status: 400 });
		}

		const anthropic = new Anthropic({
			apiKey: ANTHROPIC_API_KEY
		});

		const response = await anthropic.messages.create({
			model: 'claude-3-opus-20240229',
			max_tokens: 1000,
			messages: [
				{
					role: 'user',
					content: [
						{
							type: 'image',
							source: {
								type: 'base64',
								media_type: 'image/jpeg',
								data: image
							}
						},
						{
							type: 'text',
							text: 'Generate a haiku about this image. \
Please format the haiku with each line separated by a backslash and n (\\n) character.'
						}
					]
				}
			]
		});

		const responseText = response.content[0].type === 'text' ? response.content[0].text : '';
		return json({ response: responseText });
	} catch (error) {
		console.error('Error:', error);
		return json({ error: 'Failed to process the request' }, { status: 500 });
	}
};
