import { Problem, Submission } from "../../generated/schema";
import {
  RunSolution,
} from "../../generated/templates/Problem/Problem";
import { Problem as ProblemContract } from "../../generated/templates/Problem/Problem";
import { generateTransactionId, setMetaDataFields, setSyncingIndex } from "../helper";

export function handleRunSolution(event: RunSolution): void {
  let problem = Problem.load(event.address.toHexString());
  if (!problem) return;

  let submission = new Submission(generateTransactionId(event));
  submission.problem = problem.id;
  submission.contestant = event.params.contestant.toHexString();
  submission.version = event.params.version;
  submission.point = event.params.point;
  // read solution from the contract
  let contract = ProblemContract.bind(event.address);
  submission.solution = contract.getContestantInfo(event.params.contestant).getSolution().toHexString();

  submission.verdicts = event.params.verdicts;
  setMetaDataFields(submission, event);
  setSyncingIndex("submissions", submission);
  submission.save();
}
