// src/components/MathGame.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, Heart, Star, TrendingUp } from 'lucide-react';

// Constants
const STREAK_FOR_LEVEL_UP = 10;
const MAX_LEVEL = 4;
const MAX_LIVES = 5;

const MathGame = () => {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [operation, setOperation] = useState('+');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const savedScore = localStorage.getItem('mathGameHighScore');
    if (savedScore) {
      setHighScore(parseInt(savedScore));
    }
  }, []);

  const getDifficultyRange = () => {
    const ranges: Record<number, { max: number; min: number }> = {
      1: { max: 20, min: 1 },
      2: { max: 30, min: 10 },
      3: { max: 50, min: 20 },
      4: { max: 100, min: 30 },
    };
    return ranges[Math.min(level, MAX_LEVEL) as 1 | 2 | 3 | 4] || ranges[1];
  };

  const generateProblem = () => {
    const range = getDifficultyRange();
    let newNum1, newNum2, newOperation;

    newOperation = Math.random() < 0.5 ? '+' : '-';

    if (newOperation === '+') {
      newNum1 = Math.floor(Math.random() * (range.max - range.min)) + range.min;
      newNum2 = Math.floor(Math.random() * (range.max - newNum1)) + range.min;
    } else {
      newNum1 = Math.floor(Math.random() * (range.max - range.min)) + range.min;
      newNum2 = Math.floor(Math.random() * (newNum1 - range.min)) + range.min;
    }

    setNum1(newNum1);
    setNum2(newNum2);
    setOperation(newOperation);
    setAnswer('');
    setFeedback('');
  };

  const checkAnswer = () => {
    const correctAnswer = operation === '+'
      ? num1 + num2
      : num1 - num2;

    const userAnswer = parseInt(answer);

    if (userAnswer === correctAnswer) {
      setScore(score + 1);
      setStreak(streak + 1);
      setFeedback('Correct! 🎉');
      setShowCelebration(true);

    if (streak > 0 && streak % STREAK_FOR_LEVEL_UP === 0) {
        const newLevel = Math.min(level + 1, MAX_LEVEL);
        if (newLevel > level) {
          setFeedback(`Level Up! 🚀 Welcome to Level ${newLevel}!`);
        }
        setLevel(newLevel);
        setLives(Math.min(lives + 1, MAX_LIVES));
      }

      if (score + 1 > highScore) {
        setHighScore(score + 1);
        setIsNewHighScore(true);
        localStorage.setItem('mathGameHighScore', (score + 1).toString());
      }
    } else {
      setLives(lives - 1);
      setStreak(0);
      setFeedback(`Not quite! The answer was ${correctAnswer}. Try again!`);
      setShowCelebration(false);

      if (level > 1) {
        setLevel(level - 1);
        setFeedback(`Let's go back to Level ${level - 1} and try again!`);
      }
    }

    setTimeout(() => {
      setShowCelebration(false);
      if (lives > 1 || (lives === 1 && userAnswer === correctAnswer)) {
        generateProblem();
      }
    }, 1500);
  };

  useEffect(() => {
    generateProblem();
  }, [level]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && answer !== '') {
      checkAnswer();
    }
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
            onClick={() => {
              setLives(3);
              setScore(0);
              setStreak(0);
              setLevel(1);
              setIsNewHighScore(false);
              generateProblem();
            }}
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
        <CardTitle className="text-2xl sm:text-3xl text-center">Math Adventure!</CardTitle>
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
          {streak > 0 && streak % 5 === 0 && (
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