"use client";

import { MilikanControllerState, MilikanRuntimeParams } from "@/labs/milikan/sim/controller";
import { MilikanScene } from "@/labs/milikan/sim/scene";

interface Canvas3DProps {
  controller: MilikanControllerState;
  params: MilikanRuntimeParams;
}

export function Canvas3D({ controller, params }: Canvas3DProps) {
  return <MilikanScene state={controller} params={params} />;
}
