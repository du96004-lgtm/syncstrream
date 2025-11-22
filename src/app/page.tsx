import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AuthForm from '@/components/auth/auth-form';

export default function LandingPage() {
  const backgroundImage = PlaceHolderImages.find(img => img.id === 'landing-background');

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center p-4">
      {backgroundImage && (
        <Image
          src={backgroundImage.imageUrl}
          alt={backgroundImage.description}
          fill
          className="object-cover -z-10"
          data-ai-hint={backgroundImage.imageHint}
          priority
        />
      )}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm -z-10" />
      
      <Card className="w-full max-w-md text-center shadow-2xl bg-black/30 border-white/20">
        <CardHeader>
          <CardTitle className="font-headline text-4xl tracking-tight lg:text-5xl text-white">
            LET'S LISTEN TOGETHER
          </CardTitle>
          <CardDescription className="pt-2 text-base text-gray-300">
            Listen to your favorite music synchronously and discuss it with your friends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
        <CardFooter className="flex justify-center text-xs text-muted-foreground">
          <p>Privacy Policy | Terms of Use | Contact Us</p>
        </CardFooter>
      </Card>
    </main>
  );
}
