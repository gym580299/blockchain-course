// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "./MyERC20.sol" ;
import "hardhat/console.sol";

contract BorrowYourCar is ERC721{

    // use a event if you want
    // to represent time you can choose block.timestamp
    //event CarBorrowed(uint32 carTokenId, address borrower, uint256 startTime, uint256 duration);
    // 汽车结构体
    struct Car {
//        uint256 typ;//车型
        address owner;//车主
        address borrower;//借用人
        uint256 borrowTime;//汽车借用时间
    }

    mapping(uint256 => Car) public cars; // A map from car index to its information

    MyERC20 public myERC20; // 代币合约
    uint256 public Carcnt;
    uint256 public borrowATime=60;//最少支付

    constructor() ERC721("CAR","JF"){
        myERC20 = new MyERC20("CARTOKEN","JF");
        Carcnt=0;
    }

    //增加一辆车
    function AddCar() public {
        Carcnt++;
        cars[Carcnt]=Car(msg.sender,address (0),0);
    }
    //查询车总数
    function TotalCar()public view returns (uint256){
        return Carcnt;
    }
    //查询车是否存在
    function Exist(uint256 x) public view returns (bool) {
        return cars[x].owner != address(0);
    }
    //查询借用者是否存在
    function BorrowExist(uint256 x) public view returns (bool) {
        return cars[x].borrower != address(0);
    }
    //查询车主人
    function CarOwner(uint256 x) public view returns (address) {
        require(Exist(x), "Car does not exist!");
        return cars[x].owner;
    }
    //查询汽车当前的借用者
    function CarBorrower(uint256 x) public view returns (address,uint256) {
        require(Exist(x), "Car does not exist!");
        require(BorrowExist(x), "Car has not been borrowed!");
        return (cars[x].borrower,cars[x].borrowTime);
    }
    //查看自己拥有的汽车列表
    function GetMyList() external view returns (uint256[] memory) {
        uint256[] memory MyCars1 = new uint256[](Carcnt);//编号
//        address[] memory MyCars2 = new address[](Carcnt);//借用者
//        uint256[] memory MyCars3 = new uint256[](Carcnt);//借用时间
        uint256 cnt = 0;
        for (uint256 i = 1; i <= Carcnt; i++) {
            if (CarOwner(i)== msg.sender) {
                MyCars1[cnt] = i;
//                MyCars2[cnt]=cars[i].borrower;
//                MyCars3[cnt]=cars[i].borrowTime;
                cnt++;
            }
        }
//        return (MyCars1, MyCars2,MyCars3);
        return MyCars1;
    }
    //查看空闲汽车列表
    function GetAvailableCarList() external view returns (uint256[] memory) {
        uint256[] memory AvailableCars = new uint256[](Carcnt);
        uint256 cnt = 0;
        for (uint256 i = 1; i <= Carcnt; i++) {
            if (!BorrowExist(i)) {
                AvailableCars[cnt]=i;
                cnt++;
            }
        }
        return AvailableCars;
    }
    //选择并借用某辆还没有被借用的汽车一定时间
    function BorrowCar(uint256 x)public{
        require(Exist(x), "Car does not exist!");
        require(!BorrowExist(x),"Car has been borrowed!");
        require(CarOwner(x)!= msg.sender, "You are the owner of the car!");
        cars[x].borrower=msg.sender;
        cars[x].borrowTime=block.timestamp;
//        myERC20.approve(address(this),10000*(10**18));
        myERC20.transferFrom(msg.sender,address(this),borrowATime*(10**18));//代币转移至中端
    }
    //归还借用的车
    function returnCar(uint256 x)public{
        require(msg.sender==cars[x].borrower,"You are not the borrower!");

        uint256 res=borrowATime;
        if(block.timestamp-cars[x].borrowTime>res){
            res=block.timestamp-cars[x].borrowTime;
            myERC20.transferFrom(msg.sender,address(this),(res-borrowATime)*(10**18));
        }
        myERC20.transfer(cars[x].owner,res*(10**18));//代币转移至车主
        cars[x].borrower=address(0);
        cars[x].borrowTime=0;
    }
}