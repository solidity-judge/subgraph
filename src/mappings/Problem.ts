import { log } from "@graphprotocol/graph-ts";
import { Problem, Submission, TestVersion } from "../../generated/schema";
import {
  NewTestVersion,
  RunSolution,
} from "../../generated/templates/Problem/Problem";
import { Problem as ProblemContract } from "../../generated/templates/Problem/Problem";
import { generateTransactionId, setMetaDataFields, setSyncingIndex } from "../helper";

export function handleRunSolution(event: RunSolution): void {
  let problem = Problem.load(event.address.toHexString());
  if (!problem) {
    log.error("Problem not found: {}", [event.address.toHexString()]);
    return;
  }

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

export function handleNewTestVersion(event: NewTestVersion): void {
  let testVersion = new TestVersion(generateTransactionId(event));
  testVersion.problem = event.address.toHexString();
  testVersion.version = event.params.version;
  setMetaDataFields(testVersion, event);
  setSyncingIndex("testVersions", testVersion);
  testVersion.save();
}
