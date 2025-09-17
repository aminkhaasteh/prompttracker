import { Injectable, HttpException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';

dotenv.config(); // Load .env variables

const prisma = new PrismaClient();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

@Injectable()
export class ExtractService {

    private normalize(brand: string): string {
        return brand
            .trim()
            .toLowerCase()
            .split(' ')
            .map((w) => w[0]?.toUpperCase() + w.slice(1))
            .join(' ');
    }

    async callGeminiForBrands(text: string): Promise<Record<string, number>> {
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash-exp',
                contents: [
                    {
                        role: 'user',
                        parts: [
                            {
                                text: `
Extract ALL brand names and company names mentioned in the following text and count how many times each brand appears.

Return the result as a JSON object with brand names as keys and their occurrence counts as values.

Rules:
1. Include ALL well-known brands and companies you can identify
2. Look for brand names in product names, titles, and descriptions
3. Do not include generic product categories (like "shoes", "technology", "foam")
4. Do not include website URLs or domain names
5. Return only the main brand name (e.g., "Nike" not "Nike Air Max")
6. Be case-insensitive but return proper capitalization
7. Count each occurrence of the brand name in the text
8. Be very careful to not miss any brands - scan the entire text thoroughly

Example format:
{
  "Nike": 1,
  "Saucony": 1,
  "Asics": 1,
  "New Balance": 1,
  "Puma": 1
}

Text to analyze:
"""${text.replace(/```/g, '`')}"""
                `,
                            },
                        ],
                    },
                ],
            });

            const rawText = response.text ?? '';
            console.log('LLM raw output:', rawText);

            // Try to extract JSON from the response
            const jsonMatch = rawText.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in LLM response');
            }

            const parsed = JSON.parse(jsonMatch[0]);
            console.log('LLM parsed result:', parsed);

            // Validate that we got an object with brand counts
            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                const brandCounts: Record<string, number> = {};
                
                for (const [brand, count] of Object.entries(parsed)) {
                    if (typeof count === 'number' && count > 0) {
                        const normalizedBrand = this.normalize(brand);
                        brandCounts[normalizedBrand] = count;
                    }
                }
                
                console.log('Processed brand counts:', brandCounts);
                return brandCounts;
            } else {
                throw new Error('Invalid LLM response format - expected object with brand counts');
            }

        } catch (err) {
            console.error('LLM call failed:', err);
            throw new HttpException('LLM call failed: ' + (err instanceof Error ? err.message : 'Unknown error'), 502);
        }
    }


    async extractAndStore(text: string) {
        if (!text || text.trim().length === 0) {
            throw new HttpException('Empty input text', 400);
        }

        try {
            // 1) Save raw response to database
            const saved = await prisma.lLMResponse.create({
                data: { text },
            });

            // 2) Use LLM to detect brands and count occurrences
            console.log('Detecting brands and counting with LLM...');
            const brandCounts = await this.callGeminiForBrands(text);

            if (Object.keys(brandCounts).length === 0) {
                console.log('No brands detected by LLM');
                return {
                    id: saved.id,
                    brands: [],
                };
            }

            // 3) Store mentions in database
            const mentionsToCreate = Object.entries(brandCounts).map(([brand, count]) => ({
                brand: brand,
                normalized: brand,
                count: count,
                llmResponseId: saved.id,
            }));

            for (const mention of mentionsToCreate) {
                await prisma.mention.create({ data: mention });
            }

            console.log('Final results:', brandCounts);

            return {
                id: saved.id,
                brands: Object.entries(brandCounts).map(([name, count]) => ({ name, count })),
            };

        } catch (error) {
            console.error('Error in extractAndStore:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Internal server error', 500);
        }
    }

    async getAllResults() {
        try {
            // Get all LLM responses with their mentions
            const results = await prisma.lLMResponse.findMany({
                include: {
                    mentions: true
                },
                orderBy: {
                    id: 'desc'
                }
            });

            // Format the results for better readability
            const formattedResults = results.map(result => ({
                id: result.id,
                text: result.text.substring(0, 150) + '...', // Truncate for readability
                brands: result.mentions.map(mention => ({
                    name: mention.brand,
                    count: mention.count
                })),
                totalBrands: result.mentions.length,
                createdAt: result.createdAt
            }));

            return {
                totalAnalyses: results.length,
                results: formattedResults
            };

        } catch (error) {
            console.error('Error fetching results:', error);
            throw new HttpException('Failed to fetch results', 500);
        }
    }
}