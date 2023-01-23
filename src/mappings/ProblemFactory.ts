import { CreateProblem } from "../../generated/ProblemFactory/ProblemFactory";
import { Problem } from "../../generated/schema";
import { Problem as ProblemTemplate } from "../../generated/templates";
import { setMetaDataFields, setSyncingIndex } from "../helper";

export function handleCreateProblem(event: CreateProblem): void {
  let problem = new Problem(event.params.id.toHexString());
  problem.author = event.params.author.toHexString();
  problem.address = event.params.problem.toHexString();
  problem.checker = event.params.checker.toHexString();
  setMetaDataFields(problem, event);
  setSyncingIndex("problems", problem);
  problem.save();
  // create template
  ProblemTemplate.create(event.params.problem);
}
