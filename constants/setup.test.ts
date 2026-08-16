import {
  SETUP_TOTAL_STEPS,
  getNextSetupStep,
  getPreviousSetupStep,
  setupInfo,
} from "./setup";

describe("getNextSetupStep", () => {
  it("walks forward through every step in the flow", () => {
    expect(getNextSetupStep(1)).toEqual(setupInfo[2]);
    expect(getNextSetupStep(2)).toEqual(setupInfo[3]);
    expect(getNextSetupStep(3)).toEqual(setupInfo[4]);
  });

  it("returns null past the last step instead of throwing", () => {
    // Regression: useSetUpStep(4).goToNextStep() read `.route` off
    // setupInfo[5], which threw "Cannot read property 'route' of undefined"
    // and stranded users on the final step.
    expect(getNextSetupStep(SETUP_TOTAL_STEPS)).toBeNull();
    expect(getNextSetupStep(99)).toBeNull();
  });
});

describe("getPreviousSetupStep", () => {
  it("walks backward through every step in the flow", () => {
    expect(getPreviousSetupStep(4)).toEqual(setupInfo[3]);
    expect(getPreviousSetupStep(3)).toEqual(setupInfo[2]);
    expect(getPreviousSetupStep(2)).toEqual(setupInfo[1]);
  });

  it("returns null before the first step instead of throwing", () => {
    expect(getPreviousSetupStep(1)).toBeNull();
    expect(getPreviousSetupStep(0)).toBeNull();
  });
});

describe("setupInfo", () => {
  it("covers exactly the declared number of steps", () => {
    expect(Object.keys(setupInfo)).toHaveLength(SETUP_TOTAL_STEPS);
  });

  it("has a route and key for each step from 1 to the total", () => {
    for (let step = 1; step <= SETUP_TOTAL_STEPS; step += 1) {
      expect(setupInfo[step]?.route).toBeTruthy();
      expect(setupInfo[step]?.key).toBeTruthy();
    }
  });
});
