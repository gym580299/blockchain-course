// import {Button, Image} from 'antd';
import {Header} from "../../asset";
//import {UserOutlined} from "@ant-design/icons";
import React, { useEffect,useState } from 'react';
import {BorrowYourCarContract, myERC20Contract, web3} from "../../utils/contracts";
import './index.css';
import {isNumberObject} from "util/types";

const GanacheTestChainId = '0x539' // Ganache默认的ChainId = 0x539 = Hex(1337)
const GanacheTestChainName = 'Ganache Test Chain'
const GanacheTestChainRpcUrl = 'http://127.0.0.1:8545'

const BorrowYourCarPage = () => {

    const [account, setAccount] = useState('');
    const [accountBalance, setAccountBalance] = useState(0);
    const [totalAmount, setTotalAmount] = useState(0) ;
    const [input1, setInput1] = useState('');//输入
    const [input2, setInput2] = useState('');//输入
    const [input3, setInput3] = useState('');//输入
    const [input4, setInput4] = useState('');//输入
    const [z, setz] = useState({z1:[0],z2:[""],z3:[0]});
    const [queryResult1, setQueryResult1] = useState('');
    const [queryResult2er, setQueryResult2er] = useState( '');
    const [queryResult2ti, setQueryResult2ti] = useState(0);
    const [Listowner1, setListowner1] = useState([0]);
    const [Listborrower1, setListborrower1] = useState([""]);
    const [Listtime1, setListtime1] = useState([0]);
    const [List1, setList1] = useState([0]);
    const [List2, setList2] = useState([0]);
    const [queryResult3, setQueryResult3] = useState(false);

    useEffect(() => {
        // 初始化检查用户是否已经连接钱包
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        const initCheckAccounts = async () => {
            // @ts-ignore
            const {ethereum} = window;
            if (Boolean(ethereum && ethereum.isMetaMask)) {
                // 尝试获取连接的用户账户
                const accounts = await web3.eth.getAccounts()
                if(accounts && accounts.length) {
                    setAccount(accounts[0])
                }
            }
        }

        initCheckAccounts()
    }, [])

    useEffect(() => {
        const getBorrowYourCarContractInfo = async () => {
            if (BorrowYourCarContract) {
                const ta = await BorrowYourCarContract.methods.TotalCar().call()
                setTotalAmount(ta)
            } else {
                alert('Contract not exists.')
            }
        }

        getBorrowYourCarContractInfo()
    }, [])

    useEffect(() => {
        const getAccountInfo = async () => {
            if (myERC20Contract) {
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                setAccountBalance(ab/(10**18))
            } else {
                alert('Contract not exists.')
            }
        }

        if(account !== '') {
            getAccountInfo()
        }
    }, [account])

    //获取代币
    const onClaimTokenAirdrop = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (myERC20Contract) {
            try {
                // await myERC20Contract.methods.airdrop().send({
                //     from: account
                // })
                const t = {
                    from: account,
                    to: myERC20Contract.options.address,
                    data: myERC20Contract.methods.airdrop().encodeABI()
                };
                // 请求 MetaMask 进行事务签名
                const result = await (window as any).ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [t],
                });

                alert('你已经获得了10000代币.')
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }

    //连接钱包
    const onClickConnectWallet = async () => {
        // 查看window对象里是否存在ethereum（metamask安装后注入的）对象
        // @ts-ignore
        const {ethereum} = window;
        if (!Boolean(ethereum && ethereum.isMetaMask)) {
            alert('MetaMask is not installed!');
            return
        }

        try {
            // 如果当前小狐狸不在本地链上，切换Metamask到本地测试链
            if (ethereum.chainId !== GanacheTestChainId) {
                const chain = {
                    chainId: GanacheTestChainId, // Chain-ID
                    chainName: GanacheTestChainName, // Chain-Name
                    rpcUrls: [GanacheTestChainRpcUrl], // RPC-URL
                };

                try {
                    // 尝试切换到本地网络
                    await ethereum.request({method: "wallet_switchEthereumChain", params: [{chainId: chain.chainId}]})
                } catch (switchError: any) {
                    // 如果本地网络没有添加到Metamask中，添加该网络
                    if (switchError.code === 4902) {
                        await ethereum.request({ method: 'wallet_addEthereumChain', params: [chain]
                        });
                    }
                }
            }

            // 小狐狸成功切换网络了，接下来让小狐狸请求用户的授权
            await ethereum.request({method: 'eth_requestAccounts'});
            // 获取小狐狸拿到的授权用户列表
            const accounts = await ethereum.request({method: 'eth_accounts'});
            // 如果用户存在，展示其account，否则显示错误信息
            setAccount(accounts[0] || 'Not able to get accounts');
        } catch (error: any) {
            alert(error.message)
        }
    }

    //添加新车
    const addcar = async () => {
        if(account === '') {
            alert('You have not connected wallet！')
            return
        }

        if (BorrowYourCarContract&&myERC20Contract) {
            try {
                // await BorrowYourCarContract.method.AddCar().send({
                //     from:account
                // })

                const t = {
                    from: account,
                    to: BorrowYourCarContract.options.address,
                    data: BorrowYourCarContract.methods.AddCar().encodeABI()
                };

                // 请求 MetaMask 进行事务签名
                const result = await (window as any).ethereum.request({
                    method: 'eth_sendTransaction',
                    params: [t],
                });

                const t1=await BorrowYourCarContract.methods.TotalCar().call();
                setTotalAmount(t1);
                alert("你获得了一辆新车")
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }

    }
    const queryowner = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (BorrowYourCarContract) {
            try {
                if(input1==''){
                    alert("请在对话框中输入查询车辆的ID")
                    return
                }
                const input=parseInt(input1,10)
                const t1=await BorrowYourCarContract.methods.CarOwner(input).call({
                    from: account
                });
                setQueryResult1(t1)
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }
    const queryborrower = async () => {
        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (BorrowYourCarContract) {
            try {
                if(input2=='') {
                    alert("请在对话框中输入查询车辆的ID")
                    return
                }
                const input=parseInt(input2,10)

                // const t1=await BorrowYourCarContract.methods.BorrowExist(input).call({
                //     from: account
                // })
                // alert(t1)
                // setQueryResult3(t1)
                const t1=await BorrowYourCarContract.methods.CarBorrower(input).call({
                    from: account
                });
                setQueryResult2er(t1[0])
                setQueryResult2ti(t1[1])
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }
    const onClickMyCar = async () => {
        if(account === '') {
            alert('You have not connected wallet！')
            return
        }
        if (BorrowYourCarContract) {
            try {
                const t1=await BorrowYourCarContract.methods.GetMyList().call({
                    from: account
                });
                const L1 = Array.from(t1).map(Number);
                const L2=L1.filter(i=>i!=0)
                setList1(L2);
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }
    const onClickAvailableCar = async () => {

        if(account === '') {
            alert('You have not connected wallet！')
            return
        }
        if (BorrowYourCarContract) {
            try {
                // await BorrowYourCarContract.method.AddCar().send({
                //     from:account
                // })

                const t1=await BorrowYourCarContract.methods.GetAvailableCarList().call({
                    from: account
                });
                const L1 = Array.from(t1).map(Number);
                const L2=L1.filter(i=>i!=0)

                setList2(L2);

            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }
    const borrowcar = async () => {

        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (BorrowYourCarContract&&myERC20Contract) {
            try {
                const ab = await myERC20Contract.methods.balanceOf(account).call()
                if(ab<60*(10**18)){
                    alert("你的代币数量不够")
                    return
                }
                if(input3==''){
                    alert("请在对话框中输入想借用车辆的ID")
                    return
                }
                const input=parseInt(input3,10)
                const t1=await BorrowYourCarContract.methods.BorrowExist(input).call({
                    from: account
                });
                if(t1==false){
                    const t2=await BorrowYourCarContract.methods.CarOwner(input).call();
                    // alert(account)
                    // alert(t2)
                    if(t2==account){
                        alert("不能借用自己的车")
                        return
                    }
                }
                if(t1==true)alert("该车已被借用")
                else{
                    //approve 许可使用代币 （居然在这里花了三个小时啊啊啊啊啊
                    const t1 = {
                        from: account,
                        to: myERC20Contract.options.address,
                        data: myERC20Contract.methods.approve(BorrowYourCarContract.options.address, 10000).encodeABI()
                    };
                    // 请求 MetaMask 进行事务签名
                    const result = await (window as any).ethereum.request({
                        method: 'eth_sendTransaction',
                        params: [t1],
                    });

                    const t = {
                        from: account,
                        to: BorrowYourCarContract.options.address,
                        data: BorrowYourCarContract.methods.BorrowCar(input).encodeABI()
                    };

                    // const t=await BorrowYourCarContract.methods.BorrowCar(input).send({
                    //     from: account
                    // });
                    // 请求 MetaMask 进行事务签名
                    const result1 = await (window as any).ethereum.request({
                        method: 'eth_sendTransaction',
                        params: [t],
                    });

                    alert("借用成功")
                }
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }
    const returncar = async () => {

        if(account === '') {
            alert('You have not connected wallet yet.')
            return
        }

        if (BorrowYourCarContract) {
            try {
                if(input4==''){
                    alert("请在对话框中输入想归还车辆的ID")
                    return
                }
                const input=parseInt(input4,10)
                const t1=await BorrowYourCarContract.methods.BorrowExist(input).call({
                    from: account
                });
                // const t2;
                // if(t1){
                //
                //     t2=await BorrowYourCarContract.methods.CarBorrower(input).call({
                //         from: account
                //     });
                // }
                if(t1==false)alert("该车未被借用")
                else{
                    const t1 = {
                        from: account,
                        to: myERC20Contract.options.address,
                        data: myERC20Contract.methods.approve(BorrowYourCarContract.options.address, 10000).encodeABI()
                    };
                    // 请求 MetaMask 进行事务签名
                    const result1 = await (window as any).ethereum.request({
                        method: 'eth_sendTransaction',
                        params: [t1],
                    });

                    const t = {
                        from: account,
                        to: BorrowYourCarContract.options.address,
                        data: BorrowYourCarContract.methods.returnCar(input).encodeABI()
                    };

                    // 请求 MetaMask 进行事务签名
                    const result = await (window as any).ethereum.request({
                        method: 'eth_sendTransaction',
                        params: [t],
                    });

                    // const t2=await BorrowYourCarContract.methods.returnCar(input).send({
                    //     from: account
                    // });
                    alert("归还成功")
                }
            } catch (error: any) {
                alert(error.message)
            }

        } else {
            alert('Contract not exists.')
        }
    }
    return (
        <div className='container'>
            <img
                width='100%'
                height='100px'
                src={Header}
            />
            <div className='head'>
                <h1>汽车租赁网站</h1>
                <div className='account'>
                    {/*{account === '' && <button onClick={onClickConnectWallet}>连接钱包</button>}*/}
                    <button onClick={onClickConnectWallet}>连接钱包</button>
                    <div>当前用户：{account === '' ? '无用户连接' : account}</div>
                    <div>当前用户拥有代币数量：{account === '' ? 0 : accountBalance}</div>
                </div>
                <button onClick={onClaimTokenAirdrop}>领取租车代币10000</button>
                <div>当前总车数：{totalAmount}</div>
            </div>

            <h2>领取新车</h2>
            <button onClick={addcar}>领取</button>

            <h2>查询车主</h2>
            <input type="number" value={input1} onChange={(e) => setInput1(e.target.value)} placeholder="输入车号" />
            <button onClick={queryowner}>查询</button>
            <div>
                <p>车主: {queryResult1}</p>
            </div>

            <h2>查询借用者</h2>
            <input type="number" value={input2} onChange={(e) => setInput2(e.target.value)} placeholder="输入车号" />
            <button onClick={queryborrower}>查询</button>
            <div>
                <p>借用者: {queryResult2er} </p>
                <p>借用时间:{queryResult2ti}</p>
                {/*<p>借用情况:{queryResult3}</p>*/}
            </div>


            <h2>空闲汽车</h2>
            <button onClick={onClickAvailableCar}>查询可借用的车</button>
            <ul>
                {List2?.map((item, index) => (
                    <li>
                       <p>车号: {List2[index]}</p>
                    </li>
                ))}
            </ul>

            <h2>我的汽车</h2>
            <button onClick={onClickMyCar}>查询我的车</button>
            <ul>
                {List1?.map((item,index) => (
                    <li>
                        <p>车号: {List1[index]}</p>
                        {/*<p>车号: {Listowner1[index]}，借用者: {Listborrower1[index]},借用时间: {Listtime1[index]}</p>*/}
                    </li>
                ))}
            </ul>

            <h2>借车</h2>
            <input type="number" value={input3} onChange={(e) => setInput3(e.target.value)} placeholder="输入车号" />
            <button onClick={borrowcar}>租借</button>

            <h2>还车</h2>
            <input type="number" value={input4} onChange={(e) => setInput4(e.target.value)} placeholder="输入车号" />
            <button onClick={returncar}>归还</button>
            <img
                width='100%'
                height='100px'
                src={Header}
            />
        </div>
    )
}

export default BorrowYourCarPage