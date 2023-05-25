import { BigInt, log } from "@graphprotocol/graph-ts";
import { Problem, ProblemDeadline, Submission, TestVersion } from "../../generated/schema";
import { DeadlineUpdated, NewTestVersion, RunSolution } from "../../generated/templates/Problem/Problem";
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
  submission.point = event.params.point;
  submission.isPreDeadlineSolution = event.params.isPreDeadlineSolution;

  // read solution from the contract
  let contract = ProblemContract.bind(event.address);
  if (event.params.isPreDeadlineSolution) {
    submission.solution = contract
      .getContestantInfo(event.params.contestant)
      .getSolutionPreDeadline()
      .toHexString();
  } else {
    submission.solution = contract
      .getContestantInfo(event.params.contestant)
      .getSolutionPosDeadline()
      .toHexString();
  }

  submission.verdicts = event.params.verdicts;
  setMetaDataFields(submission, event);
  setSyncingIndex("submissions", submission);
  submission.save();
}

export function handleNewTestVersion(event: NewTestVersion): void {
  let testVersion = new TestVersion(generateTransactionId(event));
  testVersion.problem = event.address.toHexString();
  testVersion.version = event.params.version;

  let maxGasLimit = new BigInt(0);
  for (let i = 0; i < event.params.tests.length; i++) {
    if (event.params.tests[i].gasLimit > maxGasLimit) {
      maxGasLimit = event.params.tests[i].gasLimit;
    }
  }
  testVersion.gasLimit = maxGasLimit;

  setMetaDataFields(testVersion, event);
  setSyncingIndex("testVersions", testVersion);
  testVersion.save();
}

export function handlerDeadlineUpdated(event: DeadlineUpdated): void {
  let problemDeadline = ProblemDeadline.load(generateTransactionId(event));
  if (!problemDeadline) {
    problemDeadline = new ProblemDeadline(event.address.toHexString());
  }
  problemDeadline.deadline = event.params.deadline;
  problemDeadline.problem = event.address.toHexString();

  setMetaDataFields(problemDeadline, event);
  setSyncingIndex("problemDeadlines", problemDeadline);
  problemDeadline.save();
}
