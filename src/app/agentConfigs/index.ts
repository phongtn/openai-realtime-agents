import {chatSupervisorScenario} from './chatSupervisor';

import type {RealtimeAgent} from '@openai/agents/realtime';
import {langTutorScenario} from "@/app/agentConfigs/langTutor";
import {taxiDriveScenario} from "@/app/agentConfigs/langTutorTaxiDrive";

// Map of a scenario key -> array of RealtimeAgent objects
export const allAgentSets: Record<string, RealtimeAgent[]> = {
    // simpleHandoff: simpleHandoffScenario,
    // customerServiceRetail: customerServiceRetailScenario,
    chatSupervisor: chatSupervisorScenario,
    langTutor: langTutorScenario,
    taxiDrive: taxiDriveScenario
};

export const defaultAgentSetKey = 'taxiDrive';
