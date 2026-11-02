import React, { useState } from 'react';
import { 
  X, ChevronLeft, ChevronRight, Play, Sparkles, 
  CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, 
  RotateCcw, ShieldCheck, Activity 
} from 'lucide-react';

interface GuidedDemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
  onSetDemoStep: (stepId: number) => void;
  onRunServerAFailure: () => void;
}

export const GuidedDemoTour: React.FC<GuidedDemoTourProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onSetDemoStep,
  onRunServerAFailure
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  if (!isOpen) return null;

  const demoSteps = [
    {
      step: 1,
      title: "Step 1 — Normal Baseline State",
      subtitle: "Nominal Infrastructure Health = 94%",
      tab: "dashboard",
      narrative: "All 11 components in the Data Center are healthy. Ingress traffic is evenly distributed across Server A, B, and C. CPU and temperatures are within standard tolerances.",
      actionLabel: "Set Baseline State",
      action: () => {
        onSetDemoStep(1);
        onNavigateTab('dashboard');
      }
    },
    {
      step: 2,
      title: "Step 2 — Detect Telemetry Warning",
      subtitle: "Early Warning Anomaly Detection (Failure Prob = 87%)",
      tab: "predictions",
      narrative: "Telemetry sensors begin detecting anomalies on Server A: CPU spikes to 86%, core temperature reaches 74°C, and error rates rise. The transparent anomaly model calculates an 87% failure risk.",
      actionLabel: "View Predictive Failure Detection",
      action: () => {
        onSetDemoStep(2);
        onNavigateTab('predictions');
      }
    },
    {
      step: 3,
      title: "Step 3 — Open Digital Twin Topology",
      subtitle: "Visualizing Interconnected Infrastructure State",
      tab: "digital_twin",
      narrative: "Operator opens the Digital Twin canvas. Server A pulses as CRITICAL. Graph edges highlight direct upstream dependencies (Load Balancer, Power, Cooling) and downstream consumers.",
      actionLabel: "Inspect Digital Twin Topology",
      action: () => {
        onSetDemoStep(3);
        onNavigateTab('digital_twin');
      }
    },
    {
      step: 4,
      title: "Step 4 — Select 'What If Server A Fails?'",
      subtitle: "Initiating Proactive Virtual Twin Simulation",
      tab: "simulations",
      narrative: "Rather than waiting for Server A to fail ungracefully, operator selects the What-If Simulator to test the consequence before taking action in the real world.",
      actionLabel: "Open What-If Simulator",
      action: () => {
        onNavigateTab('simulations');
      }
    },
    {
      step: 5,
      title: "Step 5 — Virtual Simulation Execution",
      subtitle: "Server A Virtually OFFLINE in Twin",
      tab: "simulations",
      narrative: "The Digital Twin detaches Server A virtually. Production traffic is not impacted. The virtual load balancer trips the node offline and begins cascading recalculation.",
      actionLabel: "Execute Virtual Server Failure",
      action: () => {
        onRunServerAFailure();
        onNavigateTab('simulations');
      }
    },
    {
      step: 6,
      title: "Step 6 — Graph-Based Cascading Analysis",
      subtitle: "Evaluating Affected Blast Radius",
      tab: "simulations",
      narrative: "NetworkX graph solver tracks propagation: Load Balancer reroutes requests, surviving peers (Server B & C) absorb additional load, and Primary Database re-evaluates query queues.",
      actionLabel: "Review Cascading Propagation",
      action: () => {
        onNavigateTab('simulations');
      }
    },
    {
      step: 7,
      title: "Step 7 — Load Redistribution & Headroom Check",
      subtitle: "Capacity Validation on Server B & Server C",
      tab: "simulations",
      narrative: "The system checks surviving node capacities: Server B load rises to 82%, Server C load rises to 79%. Both remain safely below the 85% thermal saturation ceiling.",
      actionLabel: "Verify Surviving Node Headroom",
      action: () => {
        onNavigateTab('simulations');
      }
    },
    {
      step: 8,
      title: "Step 8 — Risk Calculation & Comparison",
      subtitle: "Risk Normalized: High (87%) → Low (18%)",
      tab: "comparison",
      narrative: "The system evaluates alternatives: Option A (Do nothing = 89% risk), Option B (Server B only = 68% risk), Option C (Dual balanced distribution = 18% risk). Option C is chosen.",
      actionLabel: "View Scenario Comparison Matrix",
      action: () => {
        onNavigateTab('comparison');
      }
    },
    {
      step: 9,
      title: "Step 9 — Autonomous Action Recommendation",
      subtitle: "🟢 Recommended: Redirect Traffic to Server B + Server C",
      tab: "recommendations",
      narrative: "The Autonomous Engine outputs a verified recommendation: 'Redirect Server A traffic evenly to Server B and C; 0% data loss, hitless transition, continuous operation.'",
      actionLabel: "View Prescribed Recommendation",
      action: () => {
        onNavigateTab('recommendations');
      }
    },
    {
      step: 10,
      title: "Step 10 — Resilient Infrastructure Continuity",
      subtitle: "Core Concept Demonstrated: Simulate Before Acting",
      tab: "dashboard",
      narrative: "Key take-away for judges: We did not wait for failure or diagnose after the crash. The Digital Twin predicted the danger, simulated the response, verified capacity, and optimized resilience!",
      actionLabel: "Complete Tour on Dashboard",
      action: () => {
        onNavigateTab('dashboard');
      }
    }
  ];

  const current = demoSteps[currentStep - 1];

  const handleNext = () => {
    if (currentStep < demoSteps.length) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      demoSteps[nextStep - 1].action();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      demoSteps[prevStep - 1].action();
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4 animate-slideUp">
      <div className="p-5 rounded-2xl bg-twin-card/95 border-2 border-cyan-400 shadow-2xl backdrop-blur-xl text-slate-200 glow-box-blue">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-twin-border">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-cyan-300 border border-blue-500/40">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                  Judge Demonstration Flow
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-cyan-950 text-cyan-200 border border-cyan-500/40">
                  Step {currentStep} of {demoSteps.length}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {current.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 border border-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Narrative Callout */}
        <div className="py-3.5 text-xs text-slate-300 space-y-1.5 font-sans leading-relaxed">
          <div className="text-[11px] font-mono text-cyan-300 font-semibold">
            {current.subtitle}
          </div>
          <p>{current.narrative}</p>
        </div>

        {/* Bottom Controls */}
        <div className="pt-3 border-t border-twin-border flex flex-wrap items-center justify-between gap-3">
          {/* Step Progress Dots */}
          <div className="flex items-center gap-1.5">
            {demoSteps.map(s => (
              <button
                key={s.step}
                onClick={() => {
                  setCurrentStep(s.step);
                  s.action();
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  s.step === currentStep 
                    ? 'bg-cyan-400 scale-125 ring-2 ring-cyan-400/40' 
                    : s.step < currentStep 
                    ? 'bg-emerald-500' 
                    : 'bg-slate-700'
                }`}
                title={`Step ${s.step}: ${s.title}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-twin-surface hover:bg-twin-surfaceLight border border-twin-border disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              disabled={currentStep === demoSteps.length}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md transition-all cursor-pointer border border-cyan-400/30 disabled:opacity-40"
            >
              <span>{currentStep === demoSteps.length ? 'Completed' : 'Next Step'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
