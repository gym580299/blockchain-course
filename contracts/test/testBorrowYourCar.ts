import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {boolean} from "hardhat/internal/core/params/argumentTypes";

describe("Test", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const BorrowYourCar = await ethers.getContractFactory("BorrowYourCar");
    const borrowYourCar = await BorrowYourCar.deploy();

    return { borrowYourCar, owner, otherAccount };
  }

  it("test function addcar", async function () {
    const { borrowYourCar ,owner} = await loadFixture(deployFixture);
    await borrowYourCar.AddCar();
    await borrowYourCar.AddCar();
    expect(await borrowYourCar.TotalCar()).to.equal(2);
  });
  it("test function Exist", async function () {
    const { borrowYourCar ,owner} = await loadFixture(deployFixture);
    await borrowYourCar.AddCar();
    expect(await borrowYourCar.Exist(1)).to.equal(true);
  });
  it("test Borrow", async function () {//要注释掉车主不能借用的语句
    const { borrowYourCar ,owner} = await loadFixture(deployFixture);
    await borrowYourCar.AddCar();
    await borrowYourCar.AddCar();
    await borrowYourCar.BorrowCar(2);
    expect(await borrowYourCar.BorrowExist(1)).to.equal(true);
  });
});