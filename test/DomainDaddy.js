const { expect } = require("chai")

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("DomainDaddy", () => {
  let dDaddy
  let deployer, owner1

  const NAME = "Domain Daddy"
  const SYMBOL = "DDY"

  beforeEach(async () => {
    // Setup accounts
    [deployer, owner1] = await ethers.getSigners()

    // Deploy contract
    const DomainDaddy = await ethers.getContractFactory("DomainDaddy")
    dDaddy = await DomainDaddy.deploy(NAME, SYMBOL)

    // List a domain
    const transaction = await dDaddy.connect(deployer).list("jack.eth", tokens(10))
    await transaction.wait()
  })

  describe("Deployment", () => {
    it("Sets the name", async () => {
      const result = await dDaddy.name()
      expect(result).to.equal(NAME)
    })

    it("Sets the symbol", async () => {
      const result = await dDaddy.symbol()
      expect(result).to.equal(SYMBOL)
    })

    it("Sets the owner", async () => {
      const result = await dDaddy.owner()
      expect(result).to.equal(deployer.address)
    })

    it("Returns the max supply", async () => {
      const result = await dDaddy.maxSupply()
      expect(result).to.equal(1)
    })

    it("Returns the total supply", async () => {
      const result = await dDaddy.totalSupply()
      expect(result).to.equal(0)
    })
  })

  describe("Domain", () => {
    it('Returns domain attributes', async () => {
      const domain = await dDaddy.getDomain(1)
      expect(domain.name).to.be.equal("jack.eth")
      expect(domain.cost).to.be.equal(tokens(10))
      expect(domain.isOwned).to.be.equal(false)
    })
  })

  describe("Minting", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", 'ether')

    beforeEach(async () => {
      const transaction = await dDaddy.connect(owner1).mint(ID, { value: AMOUNT })
      await transaction.wait()
    })

    it('Updates the owner', async () => {
      const owner = await dDaddy.ownerOf(ID)
      expect(owner).to.be.equal(owner1.address)
    })

    it('Updates the domain status', async () => {
      const domain = await dDaddy.getDomain(ID)
      expect(domain.isOwned).to.be.equal(true)
    })

    it('Updates the contract balance', async () => {
      const result = await dDaddy.getBalance()
      expect(result).to.be.equal(AMOUNT)
    })
  })

  describe("Withdrawing", () => {
    const ID = 1
    const AMOUNT = ethers.utils.parseUnits("10", 'ether')
    let balanceBefore

    beforeEach(async () => {
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      let transaction = await dDaddy.connect(owner1).mint(ID, { value: AMOUNT })
      await transaction.wait()

      transaction = await dDaddy.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Updates the owner balance', async () => {
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Updates the contract balance', async () => {
      const result = await dDaddy.getBalance()
      expect(result).to.equal(0)
    })
  })
})