"use client";

import { motion } from "framer-motion";
import { Check, X, Minus } from "lucide-react";

const features = [
  "Hands-on actual practice",
  "Ghana Stock Exchange real data",
  "Ghanaian mutual funds",
  "AI personal guide (Ato)",
  "Local currency (GH₵)",
  "Realistic fee structure (SEC/GSE)",
  "No bank account requirement",
  "Works natively on Mobile",
  "Free to start",
];

const columns = [
  { name: "Workshops & Books", data: [false, false, false, false, true, false, false, false, false] },
  { name: "Foreign Simulators", data: [true, false, false, false, false, false, false, true, true] },
  { name: "inv.labs", data: [true, true, true, true, true, true, true, true, true], highlight: true },
];

const ComparisonTable = () => {
  return (
    <section className="relative py-24 md:py-32 bg-white">
      <div className="px-6 md:px-12 lg:px-20 max-w-6xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 w-fit text-sm font-semibold mb-6 border border-orange-100 shadow-sm">
            <span>The Alternative</span>
          </div>
          <h2 className="font-black text-4xl md:text-5xl lg:text-6xl text-foreground mb-6 leading-tight tracking-tight">
            Nothing Else <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">Compares.</span>
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden glass-panel border border-slate-200/60 rounded-[2rem] shadow-lg bg-white/80"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-6 bg-slate-50 border-b border-slate-100 font-bold text-slate-400 uppercase tracking-widest text-xs w-1/3">Feature Evaluation</th>
                  {columns.map((col, i) => (
                    <th key={i} className={`p-6 border-b text-center font-bold text-sm tracking-wide ${col.highlight ? "bg-primary/5 text-primary border-primary/20" : "bg-slate-50 border-slate-100 text-slate-600"
                      }`}>
                      {col.name}
                      {col.highlight && <div className="h-1 w-12 bg-primary mx-auto rounded-full mt-2" />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {features.map((feature, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-5 pl-6 text-sm font-medium text-slate-600">{feature}</td>
                    {columns.map((col, j) => (
                      <td key={j} className={`p-5 text-center ${col.highlight ? "bg-primary/5 border-x border-primary/10" : ""}`}>
                        <div className="flex justify-center">
                          {col.data[i] ? (
                            col.highlight ? (
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Check className="w-5 h-5 text-primary" strokeWidth={3} />
                              </div>
                            ) : (
                              <Check className="w-5 h-5 text-slate-400" />
                            )
                          ) : (
                            <Minus className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ComparisonTable;
