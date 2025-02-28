import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '@mui/material';

// 紙吹雪の粒子の型定義
interface Particle {
  x: number;
  y: number;
  radius: number;
  color: string;
  rotation: number;
  speed: number;
  velocityX: number;
  velocityY: number;
  rotationSpeed: number;
}

interface ConfettiEffectProps {
  active: boolean;   // エフェクトを発生させるかどうか
  duration?: number; // エフェクトの継続時間（ミリ秒）
  particleCount?: number; // 粒子の数
  onComplete?: () => void; // エフェクト完了時のコールバック
}

/**
 * 祝福のためのコンフェッティ（紙吹雪）エフェクトコンポーネント
 */
export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({
  active,
  duration = 3000,
  particleCount = 100,
  onComplete,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const theme = useTheme();
  const [isActive, setIsActive] = useState(false);

  // コンフェッティの色
  const confettiColors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    '#10B981', // エメラルドグリーン
    '#F59E0B', // 琥珀色
    '#8B5CF6', // パープル
    '#EC4899', // ピンク
    '#6366F1', // インディゴ
    '#14B8A6', // ティール
  ];

  // 粒子の初期化
  const initializeParticles = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // キャンバスのサイズをウィンドウに合わせる
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: Particle[] = [];
    
    // 粒子を生成
    for (let i = 0; i < particleCount; i++) {
      // 画面上部からランダムに発生
      const x = Math.random() * canvas.width;
      const y = -20; // 画面上から少し上
      
      const radius = Math.random() * 10 + 5; // 5〜15のサイズ
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      const rotation = Math.random() * 360; // 初期回転角度
      const speed = Math.random() * 2 + 1; // 落下速度
      
      // 横方向の速度（左右にランダム）
      const velocityX = Math.random() * 2 - 1;
      const velocityY = speed;
      
      // 回転速度
      const rotationSpeed = Math.random() * 2 - 1;
      
      particles.push({
        x,
        y,
        radius,
        color,
        rotation,
        speed,
        velocityX,
        velocityY,
        rotationSpeed
      });
    }
    
    particlesRef.current = particles;
  };

  // アニメーションの描画
  const drawConfetti = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // キャンバスをクリア
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // 各粒子を描画
    particlesRef.current.forEach(particle => {
      context.save();
      
      // 粒子の中心に移動してから回転（これにより、粒子自体が回転する）
      context.translate(particle.x, particle.y);
      context.rotate((particle.rotation * Math.PI) / 180);
      
      // 四角形の紙吹雪を描画
      context.fillStyle = particle.color;
      context.fillRect(-particle.radius / 2, -particle.radius / 2, particle.radius, particle.radius / 2);
      
      context.restore();
      
      // 位置の更新
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      
      // 重力効果（加速）
      particle.velocityY += 0.05;
      
      // 回転の更新
      particle.rotation += particle.rotationSpeed;
      
      // 画面の端を超えた場合の処理
      if (particle.y > canvas.height) {
        // 画面下に到達した粒子は画面上に戻る
        particle.y = -20;
        particle.velocityY = particle.speed;
      }
      
      // 左右の端の処理
      if (particle.x < 0 || particle.x > canvas.width) {
        // 反対側から出てくる
        particle.velocityX *= -1;
      }
    });
    
    // 次のフレームをリクエスト
    if (isActive) {
      animationRef.current = requestAnimationFrame(drawConfetti);
    }
  };

  // エフェクトの開始
  const startEffect = () => {
    setIsActive(true);
    initializeParticles();
    
    // 前のタイマーをクリア
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    
    // エフェクトの持続時間後に停止
    timerRef.current = setTimeout(() => {
      setIsActive(false);
      if (onComplete) {
        onComplete();
      }
    }, duration);
  };

  // エフェクトの停止
  const stopEffect = () => {
    setIsActive(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    // キャンバスをクリア
    if (canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  };

  // active プロパティが変更された時の処理
  useEffect(() => {
    if (active && !isActive) {
      startEffect();
    } else if (!active && isActive) {
      stopEffect();
    }
  }, [active]);

  // アニメーションの開始/停止
  useEffect(() => {
    if (isActive) {
      animationRef.current = requestAnimationFrame(drawConfetti);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isActive]);

  // ウィンドウサイズ変更時の処理
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none', // マウスイベントを下のUI要素に通過させる
        zIndex: 9999,
        opacity: isActive ? 1 : 0,
        transition: 'opacity 0.5s',
      }}
    />
  );
};
