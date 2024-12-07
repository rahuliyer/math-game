'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Heart, Star, TrendingUp, Volume2, VolumeX } from 'lucide-react';

// Constants
const STREAK_FOR_LEVEL_UP = 10;
const MAX_LEVEL = 4;
const MAX_LIVES = 5;
const MIN_DIFFERENCE = 5;

// Sound setup
const correctSound = typeof Audio !== 'undefined' ? new Audio('/correct.mp3') : null;
const wrongSound = typeof Audio !== 'undefined' ? new Audio('/wrong.mp3') : null;
const levelUpSound = typeof Audio !== 'undefined' ? new Audio('/levelup.mp3') : null;
const newHighScoreSound = typeof Audio !== 'undefined' ? new Audio('/new_high_score.mp3') : null;

const MathGame = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operation, setOperation] = useState('+');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [level, setLevel] = useState(1);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameOver, setGameOver] = useState(false);

  const playSound = useCallback((sound: HTMLAudioElement | null) => {
    if (soundEnabled && sound) {
      sound.currentTime = 0;
      sound.play().catch(error => console.log('Audio playback error:', error));
    }
  }, [soundEnabled]);

  const playCorrectSound = useCallback(() => {
    playSound(correctSound);
  }, [playSound]);

  const playWrongSound = useCallback(() => {
    playSound(wrongSound);
  }, [playSound]);

  const playLevelUpSound = useCallback(() => {
    playSound(levelUpSound);
  }, [playSound]);

  const playNewHighScoreSound = useCallback(() => {
    playSound(newHighScoreSound);
  }, [playSound]);

  useEffect(() => {
    if (gameOver && isNewHighScore) {
      setTimeout(() => {
        playNewHighScoreSound();
      }, 500);
    }
  }, [gameOver, isNewHighScore, playNewHighScoreSound]);

  const getDifficultyRange = useCallback(() => {
    const ranges: Record<number, { max: number; min: number }> = {
      1: { max: 20, min: 1 },
      2: { max: 30, min: 10 },
      3: { max: 50, min: 15 },
      4: { max: 100, min: 20 },
    };
    return ranges[Math.min(level, MAX_LEVEL) as 1 | 2 | 3 | 4] || ranges[1];
  }, [level]);

  const generateProblem = useCallback(() => {
    const range = getDifficultyRange();
    const newOperation = Math.random() < 0.5 ? '+' : '-';
    let newNum1, newNum2;

    if (newOperation === '+') {
      // First decide the desired sum within range.max
      const targetSum = Math.floor(Math.random() * (range.max - 2 * range.min + 1)) + 2 * range.min;

      // Calculate possible range for first number
      const minFirst = range.min;  // First number must be at least range.min
      const maxFirst = Math.min(targetSum - range.min - MIN_DIFFERENCE, range.max - MIN_DIFFERENCE);

      // Generate first number
      newNum1 = Math.floor(Math.random() * (maxFirst - minFirst + 1)) + minFirst;

      // Second number completes the sum
      newNum2 = targetSum - newNum1;

      // Verify numbers meet criteria
      if (newNum2 < range.min || newNum2 > range.max ||
          Math.abs(newNum1 - newNum2) < MIN_DIFFERENCE ||
          newNum1 + newNum2 > range.max) {
        // If criteria not met, retry with simpler numbers
        newNum1 = range.min;
        newNum2 = Math.min(range.max - range.min, range.min + MIN_DIFFERENCE);
      }

      // Randomly swap numbers
      if (Math.random() < 0.5) {
        [newNum1, newNum2] = [newNum2, newNum1];
      }
    } else {
      // For subtraction:
      // First number (larger) should be within range
      newNum1 = Math.floor(Math.random() * (range.max - range.min - MIN_DIFFERENCE)) + range.min + MIN_DIFFERENCE;

      // Second number (smaller) should be:
      const minSecond = range.min;
      const maxSecond = Math.min(newNum1 - MIN_DIFFERENCE, range.max - MIN_DIFFERENCE);
      newNum2 = Math.floor(Math.random() * (maxSecond - minSecond + 1)) + minSecond;
    }

    setNum1(newNum1);
    setNum2(newNum2);
    setOperation(newOperation);
    setAnswer('');
    setFeedback('');
  }, [getDifficultyRange]);

  const updateLevel = useCallback((newLevel: number) => {
    setLevel(newLevel);
    generateProblem();
  }, [generateProblem]);

  const checkAnswer = useCallback(() => {
    const correctAnswer = operation === '+'
      ? num1 + num2
      : num1 - num2;

    const userAnswer = parseInt(answer);

    if (userAnswer === correctAnswer) {
      playCorrectSound();
      setScore(score + 1);
      setStreak(streak + 1);
      setFeedback('Correct! 🎉');
      setShowCelebration(true);

      if (streak > 0 && streak % STREAK_FOR_LEVEL_UP === 0) {
        const newLevel = Math.min(level + 1, MAX_LEVEL);
        if (newLevel > level) {
          playLevelUpSound();
          setFeedback(`Level Up! 🚀 Welcome to Level ${newLevel}!`);
          updateLevel(newLevel);
        }
        setLives(Math.min(lives + 1, MAX_LIVES));
      } else {
        setTimeout(() => {
          setShowCelebration(false);
          generateProblem();
        }, 1500);
      }

      if (score + 1 > highScore) {
        setHighScore(score + 1);
        setIsNewHighScore(true);
        localStorage.setItem('mathGameHighScore', (score + 1).toString());
      }
    } else {
      playWrongSound();
      const newLives = lives - 1;
      setLives(newLives);
      setStreak(0);
      setFeedback(`Not quite! The answer was ${correctAnswer}. Try again!`);
      setShowCelebration(false);

      if (level > 1) {
        setFeedback(`Let's go back to Level ${level - 1} and try again!`);
        updateLevel(level - 1);
      }

      if (newLives === 0) {
        setGameOver(true);
      }
    }
  }, [answer, generateProblem, highScore, level, lives, num1, num2, operation,
      score, streak, playCorrectSound, playWrongSound, playLevelUpSound, updateLevel]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && answer !== '') {
      checkAnswer();
    }
  };

  // Load high score on mount only
  useEffect(() => {
    const savedScore = localStorage.getItem('mathGameHighScore');
    if (savedScore) {
      setHighScore(parseInt(savedScore));
    }
    generateProblem();
  }, [generateProblem]);

  const resetGame = () => {
    setLives(MAX_LIVES);
    setScore(0);
    setStreak(0);
    setLevel(1);
    setIsNewHighScore(false);
    setGameOver(false);
    generateProblem();
  };

  const CelebrationStars = () => (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(10)].map((_, i) => (
        <Star
          key={i}
          className="absolute text-yellow-400 animate-ping"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1000}ms`,
            animationDuration: `${1000 + Math.random() * 1000}ms`,
          }}
        />
      ))}
    </div>
  );

  if (lives === 0) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl sm:text-3xl text-center">Game Over!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-xl sm:text-2xl text-center">Final Score: {score}</p>
            <p className="text-lg sm:text-xl text-center">Highest Level: {level}</p>
            <p className="text-lg sm:text-xl text-center">High Score: {highScore}</p>
          </div>

          {isNewHighScore && (
            <div className="text-center py-2 px-4 bg-yellow-100 rounded-lg">
              <p className="text-lg text-yellow-600">🏆 New High Score! 🏆</p>
            </div>
          )}

          <Button
            onClick={resetGame}
            className="w-full bg-blue-500 hover:bg-blue-600 py-6 text-lg"
          >
            Play Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-2xl sm:text-3xl">Math Adventure!</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-8 w-8"
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showCelebration && <CelebrationStars />}

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 mr-1" />
              <span className="text-lg sm:text-xl">{score}</span>
            </div>
            <div className="text-sm sm:text-base text-gray-500">
              Best: {highScore}
            </div>
          </div>
          <div className="flex items-center">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 mr-1 text-red-500" />
            <span className="text-lg sm:text-xl">{lives}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 bg-blue-100 p-3 rounded-lg">
          <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
          <span className="text-lg sm:text-xl font-medium">Level {level}</span>
        </div>

        <div className="text-center space-y-4">
          <p className="text-2xl sm:text-4xl font-bold">
            {num1} {operation} {num2} = ?
          </p>
          <input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-24 sm:w-32 text-center text-2xl sm:text-3xl p-2 border rounded-lg"
            autoFocus
          />
        </div>

        <Button
          onClick={checkAnswer}
          disabled={answer === ''}
          className="w-full bg-green-500 hover:bg-green-600 py-6 text-lg"
        >
          Check Answer
        </Button>

        {feedback && (
          <div className="text-center">
            <p className="text-lg sm:text-xl font-medium">
              {feedback}
            </p>
          </div>
        )}

        <div className="text-center space-y-2">
          <p className="text-base sm:text-lg">Streak: {streak}</p>
          {streak > 0 && streak % STREAK_FOR_LEVEL_UP === 0 && (
            <p className="text-sm sm:text-base text-green-500 font-medium">
              Next correct answer advances to next level! 🚀
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MathGame;