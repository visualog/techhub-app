
import { NextRequest, NextResponse } from "next/server";
import { db, bucket } from "@/lib/firebaseAdmin";
import { generateText, generateImage } from "@/lib/ai-provider";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { articleId } = body;

        if (!articleId) {
            return NextResponse.json({ error: "Article ID is required" }, { status: 400 });
        }

        if (!db || !bucket) {
            return NextResponse.json({ error: "Firebase Admin not initialized" }, { status: 500 });
        }

        // 1. Fetch Article
        const docRef = db.collection('articles').doc(articleId);
        const docSnap = await docRef.get();

        if (!docSnap.exists) {
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        const articleData = docSnap.data();
        const title = articleData?.title || "";

        // 2. Generate Image Prompt
        const promptForAI = `[System]
You are an art director. Create a detailed English image generation prompt for an article titled: "${title}".
The prompt should describe a modern, clean, 3D render or minimal illustration suitable for a tech blog thumbnail. 
No text in the image. Aspect ratio 4:3.
OUTPUT ONLY THE PROMPT IN ENGLISH.`;

        const imagePrompt = await generateText(promptForAI);

        if (!imagePrompt) {
            throw new Error("Failed to generate image prompt");
        }

        // 3. Generate Image
        const imageBuffer = await generateImage(imagePrompt);

        if (!imageBuffer) {
            throw new Error("Failed to generate image from AI provider");
        }

        // 4. Upload to Firebase Storage
        const imageFileName = `thumbnails/${articleId}_${Date.now()}.png`;
        const file = bucket.file(imageFileName);

        await file.save(imageBuffer, {
            metadata: { contentType: 'image/png' },
            public: true
        });

        // 5. Get Public URL
        // Construct public URL manually or use getSignedUrl if strictly private (but we set public: true)
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${imageFileName}`;

        // 6. Update Firestore
        await docRef.update({
            image: publicUrl,
            thumbnailGeneratedAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true, imageUrl: publicUrl });

    } catch (error: any) {
        console.error("Error generating thumbnail:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
